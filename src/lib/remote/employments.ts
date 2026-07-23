import { remoteFetch } from "@/lib/remote/client";
import {
  countryToString,
  employmentDetailResponseSchema,
  employmentListResponseSchema,
  employmentRecordSchema,
  type EmploymentListItem,
  type EmploymentRecord,
} from "@/lib/remote/employment-schema";

export type EmploymentStatusPolicy = "active_only" | "all";

export type FetchEmploymentsOptions = {
  pageSize?: number;
  statusPolicy?: EmploymentStatusPolicy;
  /** Max concurrent detail fetches for manager fields. */
  detailConcurrency?: number;
};

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
  concurrency = 8,
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

export async function fetchEmploymentsForOrgChart(
  options: FetchEmploymentsOptions = {},
): Promise<EmploymentRecord[]> {
  const list = await fetchAllEmploymentListItems(options);
  return enrichEmploymentsWithManagers(
    list,
    options.detailConcurrency ?? 8,
  );
}
