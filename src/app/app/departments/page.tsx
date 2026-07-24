import { redirect } from "next/navigation";

/** Legacy Departments route - department key lives on Dashboard. */
export default function DepartmentsRedirectPage() {
  redirect("/app/dashboard");
}
