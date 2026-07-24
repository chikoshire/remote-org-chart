import { redirect } from "next/navigation";

/** Data Health moved under Settings. */
export default function DataHealthRedirectPage() {
  redirect("/settings/data-health");
}
