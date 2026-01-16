import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ENV: process.env.ENV ?? "LOCAL",
  },
};

export default nextConfig;
