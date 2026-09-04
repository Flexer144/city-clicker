import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: "./",
  images: {
    loader: "custom",
    loaderFile: "./imageLoader.js",
  },
};

export default nextConfig;