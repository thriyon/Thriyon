import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 + transpile Three.js-related packages for SSR compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
};

export default nextConfig;
