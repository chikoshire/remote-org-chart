import { countryToString, type EmploymentDetail } from "@/lib/remote/employment-schema";
import { extractProfilePicture } from "@/lib/ui/avatar";

/**
 * Public-safe person profile fields for the full profile page.
 * Omits salary, bank, emergency contact, and other sensitive contract PII.
 */
export type PersonProfilePayload = {
  id: string;
  shortId: string | null;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  countryName: string | null;
  workEmail: string | null;
  loginEmail: string | null;
  avatarUrl: string | null;
  status: string | null;
  type: string | null;
  employmentModel: string | null;
  lifecycleStage: string | null;
  startDate: string | null;
  seniorityDate: string | null;
  pronouns: string | null;
  managerName: string | null;
  managerEmail: string | null;
  managerEmploymentId: string | null;
};

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function countryNameFrom(
  country: EmploymentDetail["country"],
): string | null {
  if (country == null) return null;
  if (typeof country === "string") return country;
  const name = country.name ?? country.code ?? country.iso_code;
  return typeof name === "string" ? name : null;
}

function readNestedString(
  record: Record<string, unknown>,
  path: string[],
): string | null {
  let current: unknown = record;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return asString(current);
}

export function toPersonProfilePayload(
  detail: EmploymentDetail,
): PersonProfilePayload {
  const raw = detail as unknown as Record<string, unknown>;
  const personal =
    raw.personal_details && typeof raw.personal_details === "object"
      ? (raw.personal_details as Record<string, unknown>)
      : null;

  return {
    id: detail.id,
    shortId: asString(raw.short_id),
    fullName: asString(detail.full_name) ?? asString(raw.full_name),
    jobTitle: asString(detail.job_title) ?? asString(raw.job_title),
    department: asString(detail.department) ?? asString(raw.department),
    country: countryToString(detail.country),
    countryName: countryNameFrom(detail.country),
    workEmail: asString(detail.work_email) ?? asString(raw.work_email),
    loginEmail: asString(raw.login_email),
    avatarUrl: extractProfilePicture(raw),
    status: asString(detail.status) ?? asString(raw.status),
    type: asString(raw.type),
    employmentModel: asString(raw.employment_model),
    lifecycleStage: asString(raw.employment_lifecycle_stage),
    startDate:
      asString(raw.provisional_start_date) ??
      asString(raw.start_date) ??
      readNestedString(raw, ["contract_details", "start_date"]),
    seniorityDate: asString(raw.seniority_date),
    pronouns: personal ? asString(personal.pronouns) : null,
    managerName: asString(detail.manager) ?? asString(raw.manager),
    managerEmail: asString(detail.manager_email) ?? asString(raw.manager_email),
    managerEmploymentId:
      asString(detail.manager_employment_id) ??
      asString(raw.manager_employment_id),
  };
}
