import type { NextConfig } from "next";

const nextConfig: NextConfig & {eslint?:{ignoreDuringBuilds?: boolean}} = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.freepik.com" },
    ],
  },
  eslint:{
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
