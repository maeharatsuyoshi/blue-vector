import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Keep during cutover so unmigrated rows still load. Remove after
      // scripts/migrate-blobs.ts has rewritten all DB rows in production.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
