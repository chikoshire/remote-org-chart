import { remoteFetch, RemoteApiError } from "@/lib/remote/client";
import {
  countryToString,
  type EmploymentDetail,
} from "@/lib/remote/employment-schema";
import { fetchEmploymentDetail } from "@/lib/remote/employments";
import { getRemoteWriteToken } from "@/lib/remote/write-env";
import { formatCountryLabel } from "@/lib/ui/format-country";

export type ProfileWriteField =
  | "jobTitle"
  | "department"
  | "country"
  | "managerEmploymentId";

export type ProfileWriteInput = {
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  /** Explicit null clears manager (root). */
  managerEmploymentId?: string | null;
};

export type ProfileWriteResult = {
  ok: boolean;
  persisted: ProfileWriteField[];
  localOnly: ProfileWriteField[];
  /** Safe, redacted notes keyed by field. */
  notes: Partial<Record<ProfileWriteField, string>>;
  values: {
    jobTitle: string | null;
    department: string | null;
    country: string | null;
    managerEmploymentId: string | null;
  };
};

type CompanyDepartment = {
  id: string;
  name: string;
};

/** Map UI country label / ISO-2 / ISO-3 → Remote ISO-3 code. */
export function toRemoteCountryCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  if (/^[A-Z]{2}$/.test(upper)) {
    const map: Record<string, string> = {
      US: "USA",
      GB: "GBR",
      UK: "GBR",
      CA: "CAN",
      DE: "DEU",
      FR: "FRA",
      NL: "NLD",
      IE: "IRL",
      ES: "ESP",
      PT: "PRT",
      AU: "AUS",
      BR: "BRA",
      IN: "IND",
      SG: "SGP",
      AE: "ARE",
      HK: "HKG",
      JP: "JPN",
      MX: "MEX",
      IT: "ITA",
      PL: "POL",
      SE: "SWE",
      CH: "CHE",
      NZ: "NZL",
      ZA: "ZAF",
      PH: "PHL",
    };
    return map[upper] ?? null;
  }
  const lower = trimmed.toLowerCase();
  const known = [
    "USA",
    "GBR",
    "CAN",
    "DEU",
    "FRA",
    "NLD",
    "IRL",
    "ESP",
    "PRT",
    "AUS",
    "BRA",
    "IND",
    "SGP",
    "ARE",
    "HKG",
    "JPN",
    "MEX",
    "ITA",
    "POL",
    "SWE",
    "CHE",
    "NZL",
    "ZAF",
    "PHL",
  ];
  for (const code of known) {
    if (formatCountryLabel(code)?.toLowerCase() === lower) return code;
  }
  return null;
}

async function listCompanyDepartments(
  companyId: string,
  writeToken: string,
): Promise<CompanyDepartment[]> {
  const raw = await remoteFetch<{
    data?: { company_departments?: CompanyDepartment[] };
  }>({
    path: "/v1/company-departments",
    searchParams: { company_id: companyId, page_size: 100 },
    token: writeToken,
  });
  return raw.data?.company_departments ?? [];
}

async function resolveDepartmentId(
  companyId: string,
  departmentName: string | null,
  writeToken: string,
): Promise<string | null> {
  if (departmentName === null || departmentName.trim() === "") return null;
  const name = departmentName.trim();
  const existing = await listCompanyDepartments(companyId, writeToken);
  const hit = existing.find(
    (d) => d.name.trim().toLowerCase() === name.toLowerCase(),
  );
  if (hit) return hit.id;

  const created = await remoteFetch<{
    data?: { company_department?: CompanyDepartment };
  }>({
    path: "/v1/company-departments",
    token: writeToken,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, name }),
    },
  });
  const id = created.data?.company_department?.id;
  if (!id) {
    throw new RemoteApiError({
      ok: false,
      code: "upstream",
      message: "Remote created a department but returned no id",
    });
  }
  return id;
}

function readCompanyId(detail: EmploymentDetail): string {
  const raw = detail as EmploymentDetail & { company_id?: unknown };
  if (typeof raw.company_id === "string" && raw.company_id.trim()) {
    return raw.company_id.trim();
  }
  throw new RemoteApiError({
    ok: false,
    code: "upstream",
    message: "Employment is missing company_id",
  });
}

function readUserId(detail: EmploymentDetail): string | null {
  const raw = detail as EmploymentDetail & { user_id?: unknown };
  return typeof raw.user_id === "string" && raw.user_id.trim()
    ? raw.user_id.trim()
    : null;
}

async function resolveManagerUserId(
  managerEmploymentId: string | null,
): Promise<string | null> {
  if (managerEmploymentId === null) return null;
  const detail = await fetchEmploymentDetail(managerEmploymentId);
  const userId = readUserId(detail);
  if (!userId) {
    throw new RemoteApiError({
      ok: false,
      code: "unknown",
      status: 400,
      message:
        "That manager has no Remote user id yet, so the reporting line can’t be written back.",
    });
  }
  return userId;
}

async function patchEmployment(
  employmentId: string,
  writeToken: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await remoteFetch({
    path: `/v1/employments/${employmentId}`,
    token: writeToken,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  });
}

/**
 * Persist profile fields to Remote where the API allows it for active employments.
 * Manager + department typically work; job title / country often need local fallback.
 */
export async function writeEmploymentProfile(
  employmentId: string,
  patch: ProfileWriteInput,
): Promise<ProfileWriteResult> {
  const writeToken = getRemoteWriteToken();
  if (!writeToken) {
    throw new RemoteApiError({
      ok: false,
      code: "config",
      message:
        "Missing REMOTE_API_WRITE_TOKEN (Full Access / employment:write). Add it as a server secret.",
    });
  }

  const detail = await fetchEmploymentDetail(employmentId);
  const companyId = readCompanyId(detail);

  const currentTitle = detail.job_title ?? null;
  const currentDept = detail.department ?? null;
  const currentCountry = countryToString(detail.country);
  const currentManagerEmpId = detail.manager_employment_id ?? null;

  const requested: ProfileWriteField[] = [];
  if ("jobTitle" in patch) requested.push("jobTitle");
  if ("department" in patch) requested.push("department");
  if ("country" in patch) requested.push("country");
  if ("managerEmploymentId" in patch) requested.push("managerEmploymentId");

  const coreBody: Record<string, unknown> = {};
  const softBody: Record<string, unknown> = {};
  const notes: ProfileWriteResult["notes"] = {};
  const softFields: ProfileWriteField[] = [];
  const coreFields: ProfileWriteField[] = [];

  if ("department" in patch) {
    coreBody.department_id = await resolveDepartmentId(
      companyId,
      patch.department ?? null,
      writeToken,
    );
    coreFields.push("department");
  }

  if ("managerEmploymentId" in patch) {
    coreBody.manager_id = await resolveManagerUserId(
      patch.managerEmploymentId ?? null,
    );
    coreFields.push("managerEmploymentId");
  }

  if ("jobTitle" in patch) {
    softBody.job_title = patch.jobTitle?.trim() || null;
    softFields.push("jobTitle");
  }

  if ("country" in patch) {
    if (!patch.country?.trim()) {
      softBody.country_code = null;
      softFields.push("country");
    } else {
      const code = toRemoteCountryCode(patch.country);
      if (!code) {
        notes.country =
          "Couldn’t map that country to an ISO code. Saved as a local overlay.";
      } else {
        softBody.country_code = code;
        softFields.push("country");
      }
    }
  }

  const persisted: ProfileWriteField[] = [];
  const localOnly: ProfileWriteField[] = [];

  if (Object.keys(coreBody).length > 0) {
    try {
      await patchEmployment(employmentId, writeToken, coreBody);
      persisted.push(...coreFields);
    } catch (err) {
      const message =
        err instanceof RemoteApiError
          ? err.message
          : "Remote rejected department/manager update";
      for (const field of coreFields) {
        localOnly.push(field);
        notes[field] = message;
      }
    }
  }

  if (Object.keys(softBody).length > 0) {
    try {
      await patchEmployment(employmentId, writeToken, softBody);
      persisted.push(...softFields);
    } catch (err) {
      const message =
        err instanceof RemoteApiError
          ? err.message
          : "Remote does not allow updating this field on active employments.";
      for (const field of softFields) {
        if (!localOnly.includes(field)) localOnly.push(field);
        if (!notes[field]) {
          notes[field] =
            field === "jobTitle" || field === "country"
              ? "Remote blocks this change on active employments (needs a contract amendment in Remote). Kept as a local overlay."
              : message;
        }
      }
    }
  }

  if ("country" in patch && notes.country && !softFields.includes("country")) {
    if (!localOnly.includes("country")) localOnly.push("country");
  }

  for (const field of requested) {
    if (!persisted.includes(field) && !localOnly.includes(field)) {
      localOnly.push(field);
    }
  }

  return {
    ok: true,
    persisted,
    localOnly,
    notes,
    values: {
      jobTitle:
        "jobTitle" in patch ? patch.jobTitle?.trim() || null : currentTitle,
      department:
        "department" in patch
          ? patch.department?.trim() || null
          : currentDept,
      country:
        "country" in patch
          ? patch.country?.trim()
            ? toRemoteCountryCode(patch.country) || patch.country.trim()
            : null
          : currentCountry,
      managerEmploymentId:
        "managerEmploymentId" in patch
          ? (patch.managerEmploymentId ?? null)
          : currentManagerEmpId,
    },
  };
}
