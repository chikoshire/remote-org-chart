import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";
import { sharePreviewMetadata } from "@/lib/seo/share-preview";

export const metadata: Metadata = sharePreviewMetadata({
  title: "Log in",
  description: "Sign in to Acme Org Chart to explore reporting lines and people.",
  path: "/login",
  imagePath: "/marketing/app-dashboard.png",
});

export default function LoginPage() {
  return <LoginPageClient />;
}
