/**
 * Tiny deterministic forest for Playwright — no PII from sandbox.
 * Shape matches /api/org-chart success payload.
 */
export const orgChartReadyFixture = {
  ok: true as const,
  nodeCount: 2,
  rootCount: 1,
  cycleCount: 0,
  orphanManagerCount: 0,
  roots: [
    {
      id: "emp_root",
      fullName: "Alex Root",
      jobTitle: "Chief of Staff",
      department: "Operations",
      departmentId: "dept_ops",
      status: "active",
      country: "USA",
      managerEmploymentId: null,
      inCycle: false,
      directReports: 1,
      children: [
        {
          id: "emp_report",
          fullName: "Jordan Report",
          jobTitle: "Analyst",
          department: "Operations",
          departmentId: "dept_ops",
          status: "active",
          country: "USA",
          managerEmploymentId: "emp_root",
          inCycle: false,
          directReports: 0,
          children: [],
        },
      ],
    },
  ],
  nodes: [
    {
      id: "emp_root",
      fullName: "Alex Root",
      jobTitle: "Chief of Staff",
      department: "Operations",
      departmentId: "dept_ops",
      status: "active",
      country: "USA",
      managerEmploymentId: null,
      inCycle: false,
      directReports: 1,
      workEmail: null,
    },
    {
      id: "emp_report",
      fullName: "Jordan Report",
      jobTitle: "Analyst",
      department: "Operations",
      departmentId: "dept_ops",
      status: "active",
      country: "USA",
      managerEmploymentId: "emp_root",
      inCycle: false,
      directReports: 0,
      workEmail: null,
    },
  ],
};

export const orgChartEmptyFixture = {
  ok: true as const,
  nodeCount: 0,
  rootCount: 0,
  cycleCount: 0,
  orphanManagerCount: 0,
  roots: [],
  nodes: [],
};

export const orgChartErrorFixture = {
  ok: false as const,
  code: "unauthorized",
  message:
    "Remote sandbox rejected the token. Confirm the read-only sandbox key still works, then retry.",
};
