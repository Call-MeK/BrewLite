import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Cấp phép cho link Unsplash
      },
      {
        protocol: "https",
        hostname: "placehold.co", // Cấp phép cho link ảnh lỗi
      },
    ],
  },
};

export default nextConfig;
