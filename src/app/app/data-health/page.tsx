import { redirect } from "next/navigation";

/** Data Health lives under Settings. */
export default function DataHealthRedirectPage() {
  redirect("/settings/data-health");
}
