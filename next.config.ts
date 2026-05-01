import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => "midnight-narrative-constructor",
};

export default nextConfig;
