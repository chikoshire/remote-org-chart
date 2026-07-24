import { redirect } from "next/navigation";

/** Data Health is a primary surface at `/app/data-health`. */
export default function SettingsDataHealthRedirectPage() {
  redirect("/app/data-health");
}
