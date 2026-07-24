import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Allow Cursor IDE browser / localtunnel hosts to load Next dev assets.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.loca.lt",
    "*.localtunnel.me",
    "*.trycloudflare.com",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
