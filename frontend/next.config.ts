import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Emit a self-contained server bundle (.next/standalone) for a slim Docker image.
  output: "standalone",
};

export default nextConfig;
