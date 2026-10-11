import type { NextConfig } from "next";

const isPages = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH ?? "/Grevix_Deadline_Copilot";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_STATIC_EXPORT: "1" },
      }
    : {
        // PPR / cache components are server features and break `output: "export"`.
        cacheComponents: true,
        partialPrefetching: true,
      }),
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
