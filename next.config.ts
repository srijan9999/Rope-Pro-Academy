import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/reviews",
        destination: "/#testimonials",
        permanent: true,
      },
      {
        source: "/records",
        destination: "/achievements",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
