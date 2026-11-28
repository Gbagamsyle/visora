import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev server's incremental output separate from `next build` output.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
