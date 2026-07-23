import { describe, expect, it } from "vitest";
import {
  countryToString,
  employmentListItemSchema,
  employmentListResponseSchema,
  employmentRecordSchema,
} from "@/lib/remote/employment-schema";

describe("employment schemas", () => {
  it("parses list response with paging", () => {
    const parsed = employmentListResponseSchema.parse({
      data: {
        employments: [
          {
            id: "emp_1",
            full_name: "Ada Lovelace",
            job_title: "Engineer",
            status: "active",
            department: null,
          },
        ],
        total_count: 1,
        current_page: 1,
        total_pages: 1,
      },
    });
    expect(parsed.data.employments[0]?.id).toBe("emp_1");
  });

  it("allows partial list rows", () => {
    const row = employmentListItemSchema.parse({
      id: "emp_2",
      full_name: null,
      job_title: null,
    });
    expect(row.id).toBe("emp_2");
  });

  it("normalizes country objects", () => {
    expect(countryToString({ code: "PT" })).toBe("PT");
    expect(countryToString("US")).toBe("US");
    expect(countryToString(null)).toBeNull();
  });

  it("builds org-chart records", () => {
    const record = employmentRecordSchema.parse({
      id: "emp_1",
      fullName: "Ada",
      jobTitle: "Engineer",
      department: "R&D",
      departmentId: "dep_1",
      status: "active",
      country: "PT",
      workEmail: "ada@example.com",
      managerName: "Boss",
      managerEmploymentId: "emp_0",
    });
    expect(record.managerEmploymentId).toBe("emp_0");
  });
});
