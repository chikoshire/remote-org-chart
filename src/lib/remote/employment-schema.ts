import { z } from "zod";

/** List payload fields from GET /v1/employments (manager fields are NOT on list). */
export const employmentListItemSchema = z
  .object({
    id: z.string().min(1),
    short_id: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    full_name: z.string().optional().nullable(),
    job_title: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    department_id: z.string().optional().nullable(),
    country: z
      .union([z.string(), z.record(z.string(), z.unknown())])
      .optional()
      .nullable(),
    work_email: z.string().optional().nullable(),
    personal_email: z.string().optional().nullable(),
    login_email: z.string().optional().nullable(),
    employment_lifecycle_stage: z.string().optional().nullable(),
    employment_model: z.string().optional().nullable(),
    external_id: z.string().optional().nullable(),
  })
  .passthrough();

export const employmentListResponseSchema = z.object({
  data: z.object({
    employments: z.array(employmentListItemSchema),
    total_count: z.number().optional(),
    current_page: z.number().optional(),
    total_pages: z.number().optional(),
  }),
});

/** Manager + display fields from GET /v1/employments/:id */
export const employmentDetailSchema = z
  .object({
    id: z.string().min(1),
    full_name: z.string().optional().nullable(),
    job_title: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    department_id: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    country: z
      .union([z.string(), z.record(z.string(), z.unknown())])
      .optional()
      .nullable(),
    work_email: z.string().optional().nullable(),
    manager: z.string().optional().nullable(),
    manager_email: z.string().optional().nullable(),
    manager_id: z.string().optional().nullable(),
    manager_employment_id: z.string().optional().nullable(),
  })
  .passthrough();

export const employmentDetailResponseSchema = z.object({
  data: z.object({
    employment: employmentDetailSchema,
  }),
});

export type EmploymentListItem = z.infer<typeof employmentListItemSchema>;
export type EmploymentDetail = z.infer<typeof employmentDetailSchema>;

/** Org-chart row after list + detail merge. */
export const employmentRecordSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().nullable(),
  jobTitle: z.string().nullable(),
  department: z.string().nullable(),
  departmentId: z.string().nullable(),
  status: z.string().nullable(),
  country: z.string().nullable(),
  workEmail: z.string().nullable(),
  managerName: z.string().nullable(),
  managerEmploymentId: z.string().nullable(),
});

export type EmploymentRecord = z.infer<typeof employmentRecordSchema>;

export function countryToString(
  country: EmploymentListItem["country"] | EmploymentDetail["country"],
): string | null {
  if (country == null) return null;
  if (typeof country === "string") return country;
  const code = country.code ?? country.name ?? country.iso_code;
  return typeof code === "string" ? code : null;
}
