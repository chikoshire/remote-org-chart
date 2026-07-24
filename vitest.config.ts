import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    env: {
      DEMO_APP_EMAIL: process.env.DEMO_APP_EMAIL ?? "demo@acme.example",
      DEMO_APP_PASSWORD:
        process.env.DEMO_APP_PASSWORD ?? "local-dev-only-set-DEMO_APP_PASSWORD",
      APP_SESSION_SECRET:
        process.env.APP_SESSION_SECRET ??
        "local-dev-only-set-APP_SESSION_SECRET",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
