import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
    // Resume uploads are up to 2 MB; default Server Action limit is 1 MB.
    // Employer registration allows four 2 MB documents.
    serverActions: { bodySizeLimit: "9mb" },
  },
};

export default nextConfig;