import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // Recomendado para exportación PWA
  images: {
    unoptimized: true, // Necesario para exportación estática
  },
};

export default nextConfig;
