import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins file tracing to this project, not the nested admin-app/ — it has
  // its own package-lock.json, and Next would otherwise guess the wrong
  // workspace root.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Read-only: lets pre-migration banner images hosted on Cloudinary keep
    // rendering. New uploads are written to public/uploads via
    // src/utils/local-storage.util.ts and don't need a remote pattern.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
