/**
 * Dedicated enrich Worker so each batch gets its own Workers Free
 * outbound-connection budget (6). The Next app fans out via service binding
 * `ORG_ENRICH` — same-Worker self-fetch is blocked (1042), and same-Worker
 * service binding does not multiply connection pools usefully under OpenNext.
 */

type EnrichItem = {
  id: string;
  full_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  department_id?: string | null;
  status?: string | null;
  country?: string | Record<string, unknown> | null;
  work_email?: string | null;
  [key: string]: unknown;
};

type EnrichRecord = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  departmentId: string | null;
  status: string | null;
  country: string | null;
  workEmail: string | null;
  avatarUrl: string | null;
  managerName: string | null;
  managerEmploymentId: string | null;
};

type Env = {
  REMOTE_API_TOKEN: string;
  REMOTE_API_BASE_URL: string;
};

const DETAIL_CONCURRENCY = 6;
const MAX_BATCH = 12;

function countryToString(
  country: EnrichItem["country"],
): string | null {
  if (country == null) return null;
  if (typeof country === "string") return country;
  const code = country.code ?? country.name ?? country.iso_code;
  return typeof code === "string" ? code : null;
}

function extractProfilePicture(
  ...sources: Array<Record<string, unknown> | null | undefined>
): string | null {
  for (const src of sources) {
    if (!src) continue;
    const direct = src.profile_picture ?? src.profilePicture;
    if (typeof direct === "string" && direct.startsWith("https://")) {
      return direct;
    }
    const user = src.user;
    if (user && typeof user === "object") {
      const pic =
        (user as Record<string, unknown>).profile_picture ??
        (user as Record<string, unknown>).profilePicture;
      if (typeof pic === "string" && pic.startsWith("https://")) return pic;
    }
  }
  return null;
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
  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, Math.max(items.length, 1)) },
      () => worker(),
    ),
  );
  return results;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { ok: false, code: "method_not_allowed" },
        { status: 405 },
      );
    }

    const token = env.REMOTE_API_TOKEN?.trim();
    const base = env.REMOTE_API_BASE_URL?.replace(/\/+$/, "");
    if (!token || !base) {
      return Response.json(
        { ok: false, code: "config", message: "Remote API env is invalid" },
        { status: 500 },
      );
    }

    const secret = request.headers.get("x-org-enrich-secret");
    if (!secret || secret !== token) {
      return Response.json(
        { ok: false, code: "unauthorized", message: "Invalid enrich secret" },
        { status: 401 },
      );
    }

    let items: EnrichItem[];
    try {
      const json = (await request.json()) as { items?: EnrichItem[] };
      if (!Array.isArray(json.items) || json.items.length === 0) {
        throw new Error("empty");
      }
      if (json.items.length > MAX_BATCH) {
        return Response.json(
          {
            ok: false,
            code: "bad_request",
            message: `Body must be { items: [1..${MAX_BATCH}] }`,
          },
          { status: 400 },
        );
      }
      items = json.items;
    } catch {
      return Response.json(
        {
          ok: false,
          code: "bad_request",
          message: `Body must be { items: EmploymentListItem[1..${MAX_BATCH}] }`,
        },
        { status: 400 },
      );
    }

    try {
      const records = await mapPool(
        items,
        DETAIL_CONCURRENCY,
        async (item): Promise<EnrichRecord> => {
          const url = `${base}/v1/employments/${encodeURIComponent(item.id)}`;
          const res = await fetch(url, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const text = await res.text();
          if (!res.ok) {
            throw new Error(`detail ${item.id} → ${res.status}: ${text.slice(0, 120)}`);
          }
          const parsed = JSON.parse(text) as {
            data?: { employment?: Record<string, unknown> };
          };
          const detail = parsed.data?.employment ?? {};
          return {
            id: item.id,
            fullName:
              (typeof detail.full_name === "string" ? detail.full_name : null) ??
              item.full_name ??
              null,
            jobTitle:
              (typeof detail.job_title === "string" ? detail.job_title : null) ??
              item.job_title ??
              null,
            department:
              (typeof detail.department === "string" ? detail.department : null) ??
              item.department ??
              null,
            departmentId:
              (typeof detail.department_id === "string"
                ? detail.department_id
                : null) ??
              item.department_id ??
              null,
            status:
              (typeof detail.status === "string" ? detail.status : null) ??
              item.status ??
              null,
            country: countryToString(
              (detail.country as EnrichItem["country"]) ?? item.country,
            ),
            workEmail:
              (typeof detail.work_email === "string" ? detail.work_email : null) ??
              item.work_email ??
              null,
            avatarUrl: extractProfilePicture(
              detail,
              item as Record<string, unknown>,
            ),
            managerName:
              typeof detail.manager === "string" ? detail.manager : null,
            managerEmploymentId:
              typeof detail.manager_employment_id === "string"
                ? detail.manager_employment_id
                : null,
          };
        },
      );

      return Response.json({ ok: true, records });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enrich batch failed";
      return Response.json(
        { ok: false, code: "upstream", message },
        { status: 502 },
      );
    }
  },
};
