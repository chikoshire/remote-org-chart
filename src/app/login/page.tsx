"use client";

import { type FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AcmeLogo } from "@/components/brand/AcmeLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/app/dashboard";
  const [email, setEmail] = useState("demo@acme.example");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !body.ok) {
        setError(body.message ?? "Could not log in.");
        return;
      }
      const safeNext =
        nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/app/dashboard";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm font-medium text-norma-prussian">
        Email
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-norma-md border border-norma-border bg-white px-3 py-2.5 text-sm outline-none focus:border-norma-royal"
        />
      </label>
      <label className="block text-sm font-medium text-norma-prussian">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-norma-md border border-norma-border bg-white px-3 py-2.5 text-sm outline-none focus:border-norma-royal"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-norma-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-norma-md bg-[#e85d04] px-4 py-2.5 text-sm font-semibold text-norma-prussian hover:bg-[#ff7a2f] disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Log in"}
      </button>
      <p className="text-xs leading-relaxed text-norma-ink-muted">
        Interview demo: use the credentials in the README. Remote API tokens
        stay on the server and never appear in this form.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-norma-canvas">
      <header className="flex items-center justify-between border-b border-norma-border bg-white px-5 py-4 md:px-8">
        <Link href="/">
          <AcmeLogo withWordmark />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-norma-ink-muted hover:text-norma-prussian"
        >
          Back to home
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
          Log in to Acme
        </h1>
        <p className="mt-2 text-sm text-norma-ink-muted">
          Access the org chart, people directory, and data health tools.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-norma-ink-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
