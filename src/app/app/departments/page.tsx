import { redirect } from "next/navigation";

/** Departments live under People → Departments view. */
export default function DepartmentsRedirectPage() {
  redirect("/app/people?view=departments");
}
