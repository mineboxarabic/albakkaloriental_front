import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./lib/security-headers";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alimexpress-buckeyt.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "anahit.fr",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "amilapps.com", pathname: "/azimages/**" },
      // Brand logos: letter avatars and favicons Alim Express stores for brands without a photo.
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
