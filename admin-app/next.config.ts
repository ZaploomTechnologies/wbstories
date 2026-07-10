import path from "node:path";
import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // Pins file tracing to this project, not the sibling wbstories app one
  // level up — both have their own package-lock.json, and Next would
  // otherwise guess the wrong workspace root.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // This app has no database access of its own — every /api/* call and every
  // uploaded banner image is proxied straight through to the main wbstories
  // app. From the browser's point of view everything stays same-origin, so
  // the existing httpOnly session cookie (host-only by design, see
  // src/utils/cookie.util.ts in the main app) keeps working without CORS or
  // a shared cookie domain.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
