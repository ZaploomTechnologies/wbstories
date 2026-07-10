import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
