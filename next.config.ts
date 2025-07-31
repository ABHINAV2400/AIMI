import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint Configuration
  eslint: {
    // Skip ESLint during production builds to avoid blocking deployments
    // This is useful when you have a separate CI/CD pipeline that handles linting
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
