import type { NextConfig } from "next";

function getUploadThingHost(): string {
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (token) {
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      if (parsed.appId && typeof parsed.appId === "string") {
        console.log(`[next.config] Derived UploadThing host: ${parsed.appId}.ufs.sh`);
        return `${parsed.appId}.ufs.sh`;
      }
    } catch {
      // Fall through to warning
    }
  }
  console.warn(
    "⚠️ [next.config] UPLOADTHING_TOKEN not set or does not contain appId. Falling back to wildcard *.ufs.sh."
  );
  return "*.ufs.sh";
}

const uploadThingHost = getUploadThingHost();

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [
      // utfs.io kept for backwards compatibility with existing Media table rows that may use legacy UploadThing URLs
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: uploadThingHost },
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
