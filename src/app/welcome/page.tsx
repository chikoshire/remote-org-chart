import { redirect } from "next/navigation";

/** Legacy welcome URL; marketing lives at `/`. */
export default function WelcomeRedirect() {
  redirect("/");
}
