import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ph/:path*",
        destination: "https://eu.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
