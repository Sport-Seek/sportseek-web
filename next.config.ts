import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ENV: process.env.ENV ?? "LOCAL",
    PUBLIC_TOKEN_MAPBOX: process.env.PUBLIC_TOKEN_MAPBOX ?? "",
  },
};

export default nextConfig;
