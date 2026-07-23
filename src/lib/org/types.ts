import type { EmploymentRecord } from "@/lib/remote/employment-schema";

export type OrgNode = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  departmentId: string | null;
  status: string | null;
  country: string | null;
  workEmail: string | null;
  managerEmploymentId: string | null;
  children: OrgNode[];
  /** True when this node participates in a detected reporting cycle. */
  inCycle: boolean;
  /** Direct report count (immediate children). */
  directReports: number;
};

export type OrgForest = {
  roots: OrgNode[];
  /** Manager ids referenced but missing from the dataset. */
  orphanManagerIds: string[];
  /** Employment ids that sit on a cycle. */
  cycleIds: string[];
  nodeCount: number;
};
