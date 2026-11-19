import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // Service photos are uploaded to ImgBB by the Add Service form, so this is
    // the only remote host the app needs to know about. Without it Next refuses
    // to optimise remote images, and a 2 MB photo would be sent to phones as-is.
    remotePatterns: [{ protocol: "https", hostname: "i.ibb.co" }],
  },
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
