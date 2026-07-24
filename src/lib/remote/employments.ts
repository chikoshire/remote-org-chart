import { getCloudflareContext } from "@opennextjs/cloudflare";
import { remoteFetch, RemoteApiError } from "@/lib/remote/client";
import { chunkArray } from "@/lib/remote/chunk";
import {
  countryToString,
  employmentDetailResponseSchema,
  employmentListResponseSchema,
  employmentRecordSchema,
  type EmploymentListItem,
  type EmploymentRecord,
} from "@/lib/remote/employment-schema";

export type EmploymentStatusPolicy = "active_only" | "all";

/**
 * Workers Free allows 50 subrequests per invocation. List pages are cheap;
 * per-employment detail GETs are not — fan out in batches under this size.
 */
export const ENRICH_BATCH_SIZE = 40;

/** Workers also cap simultaneous outbound connections at 6. */
export const ENRICH_DETAIL_CONCURRENCY = 6;

export type EnrichFanOut = {
  /** Public origin of this Worker (e.g. https://….workers.dev). Fallback for non-binding fetch. */
  origin: string;
  /** Shared secret — same value as REMOTE_API_TOKEN, never sent to browsers. */
  secret: string;
};

type WorkerSelfFetcher = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

function getWorkerSelfBinding(): WorkerSelfFetcher | null {
  try {
    const { env } = getCloudflareContext();
    const binding = (env as { WORKER_SELF?: WorkerSelfFetcher }).WORKER_SELF;
    if (binding && typeof binding.fetch === "function") return binding;
    return null;
  } catch {
    return null;
  }
}

export type FetchEmploymentsOptions = {
  pageSize?: number;
  statusPolicy?: EmploymentStatusPolicy;
  /** Max concurrent detail fetches for manager fields. */
  detailConcurrency?: number;
  /**
   * On Cloudflare, fan out detail enrichment across sibling invocations so
   * each stays under the subrequest limit. Local `next dev` ignores this.
   */
  fanOut?: EnrichFanOut;
};

function isCloudflareRuntime(): boolean {
  try {
    getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}

const ACTIVE_STATUSES = new Set(["active", "hired", "employed"]);

function isActiveStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return ACTIVE_STATUSES.has(status.toLowerCase());
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function fetchEmploymentPage(page: number, pageSize: number) {
  const raw = await remoteFetch<unknown>({
    path: "/v1/employments",
    searchParams: { page, page_size: pageSize },
  });
  return employmentListResponseSchema.parse(raw);
}

/**
 * Paginate GET /v1/employments.
 * Note: list responses do not include manager_* — callers that need hierarchy
 * must run {@link enrichEmploymentsWithManagers}.
 */
export async function fetchAllEmploymentListItems(
  options: FetchEmploymentsOptions = {},
): Promise<EmploymentListItem[]> {
  const pageSize = options.pageSize ?? 100;
  const statusPolicy = options.statusPolicy ?? "active_only";

  const first = await fetchEmploymentPage(1, pageSize);
  const totalPages = first.data.total_pages ?? 1;
  const pages = [first.data.employments];

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchEmploymentPage(page, pageSize);
    pages.push(next.data.employments);
  }

  const flat = pages.flat();
  if (statusPolicy === "all") return flat;
  return flat.filter((e) => isActiveStatus(e.status));
}

export async function fetchEmploymentDetail(employmentId: string) {
  const raw = await remoteFetch<unknown>({
    path: `/v1/employments/${employmentId}`,
  });
  return employmentDetailResponseSchema.parse(raw).data.employment;
}

export async function enrichEmploymentsWithManagers(
  listItems: EmploymentListItem[],
  concurrency = ENRICH_DETAIL_CONCURRENCY,
): Promise<EmploymentRecord[]> {
  return mapPool(listItems, concurrency, async (item) => {
    const detail = await fetchEmploymentDetail(item.id);
    return employmentRecordSchema.parse({
      id: item.id,
      fullName: detail.full_name ?? item.full_name ?? null,
      jobTitle: detail.job_title ?? item.job_title ?? null,
      department: detail.department ?? item.department ?? null,
      departmentId: detail.department_id ?? item.department_id ?? null,
      status: detail.status ?? item.status ?? null,
      country: countryToString(detail.country ?? item.country),
      workEmail: detail.work_email ?? item.work_email ?? null,
      managerName: detail.manager ?? null,
      managerEmploymentId: detail.manager_employment_id ?? null,
    });
  });
}

/**
 * Fan out detail enrichment to `/api/org-chart/enrich-batch` so each Worker
 * invocation stays under the free-plan subrequest cap (~50).
 * Prefer the WORKER_SELF service binding (new invocation budget per batch).
 */
export async function enrichEmploymentsViaFanOut(
  listItems: EmploymentListItem[],
  fanOut: EnrichFanOut,
): Promise<EmploymentRecord[]> {
  const batches = chunkArray(listItems, ENRICH_BATCH_SIZE);
  if (batches.length === 0) return [];

  const self = getWorkerSelfBinding();
  const publicEndpoint = `${fanOut.origin.replace(/\/+$/, "")}/api/org-chart/enrich-batch`;
  // Service bindings need an absolute URL; host is ignored for routing.
  const bindingEndpoint = "https://worker-self/api/org-chart/enrich-batch";

  const parts = await Promise.all(
    batches.map(async (items) => {
      const init: RequestInit = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-org-enrich-secret": fanOut.secret,
        },
        body: JSON.stringify({ items }),
        cache: "no-store",
      };

      const response = self
        ? await self.fetch(new Request(bindingEndpoint, init))
        : await fetch(publicEndpoint, init);

      const text = await response.text();
      let parsed: {
        ok?: boolean;
        records?: EmploymentRecord[];
        message?: string;
      };
      try {
        parsed = JSON.parse(text) as typeof parsed;
      } catch {
        throw new RemoteApiError({
          ok: false,
          code: "upstream",
          message: `Enrich batch non-JSON (${response.status}) via ${self ? "WORKER_SELF" : publicEndpoint}: ${text.slice(0, 160)}`,
          status: response.status,
        });
      }

      if (!response.ok || !parsed.ok || !parsed.records) {
        throw new RemoteApiError({
          ok: false,
          code: "network",
          message: parsed.message ?? `Enrich batch failed (${response.status})`,
          status: response.status,
        });
      }

      return parsed.records;
    }),
  );

  return parts.flat();
}

export async function fetchEmploymentsForOrgChart(
  options: FetchEmploymentsOptions = {},
): Promise<EmploymentRecord[]> {
  const list = await fetchAllEmploymentListItems(options);
  const concurrency =
    options.detailConcurrency ?? ENRICH_DETAIL_CONCURRENCY;

  if (options.fanOut && isCloudflareRuntime()) {
    return enrichEmploymentsViaFanOut(list, options.fanOut);
  }

  return enrichEmploymentsWithManagers(list, concurrency);
}
