import { describe, expect, it } from "vitest";
import { toPersonProfilePayload } from "@/lib/remote/person-profile";

describe("toPersonProfilePayload", () => {
  it("maps safe employment detail fields and skips sensitive contract data", () => {
    const profile = toPersonProfilePayload({
      id: "emp-1",
      full_name: "Ada Lovelace",
      job_title: "Engineer",
      department: "Engineering",
      status: "active",
      country: { code: "GB", name: "United Kingdom" },
      work_email: "ada@acme.example",
      manager: "Charles Babbage",
      manager_email: "charles@acme.example",
      manager_employment_id: "emp-0",
      short_id: "A1",
      type: "employee",
      employment_model: "direct",
      employment_lifecycle_stage: "employed",
      provisional_start_date: "2020-01-15",
      seniority_date: "2021-06-01",
      login_email: "ada.login@acme.example",
      personal_details: { pronouns: "she/her" },
      contract_details: {
        start_date: "2020-01-15",
        salary: { amount: 999999, currency: "GBP" },
      },
    } as never);

    expect(profile).toMatchObject({
      id: "emp-1",
      shortId: "A1",
      fullName: "Ada Lovelace",
      jobTitle: "Engineer",
      department: "Engineering",
      country: "GB",
      countryName: "United Kingdom",
      workEmail: "ada@acme.example",
      loginEmail: "ada.login@acme.example",
      status: "active",
      type: "employee",
      employmentModel: "direct",
      lifecycleStage: "employed",
      startDate: "2020-01-15",
      seniorityDate: "2021-06-01",
      pronouns: "she/her",
      managerName: "Charles Babbage",
      managerEmail: "charles@acme.example",
      managerEmploymentId: "emp-0",
    });
    expect(JSON.stringify(profile)).not.toContain("999999");
    expect(JSON.stringify(profile)).not.toContain("salary");
  });
});
