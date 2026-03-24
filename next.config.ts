import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Disabling type checking is not recommended, but it can be useful in certain scenarios.
    // Make sure to run `tsc --noEmit` separately to catch type errors during development.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
