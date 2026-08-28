import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the preview iframe (preview-chat-*.space-z.ai) to load Next.js dev assets
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
