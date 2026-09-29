import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos are uploaded through server actions; the default limit is 1 MB
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
