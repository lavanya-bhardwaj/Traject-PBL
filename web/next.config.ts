import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Resume uploads are up to 2 MB; the default Server Action limit is 1 MB.
    // Employer registration allows four 2 MB documents; resume uploads allow one.
    serverActions: { bodySizeLimit: "9mb" },
  },
};

export default nextConfig;
