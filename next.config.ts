import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    // Google Cloud SQL Database Connection
    // Host: 34.35.76.77
    // Database: vista_travel
    // User: vista_admin
    // Password URL-encoded: g^i:ZgmcG`~[o*^P
    DATABASE_URL: 'postgresql://vista_admin:g%5Ei%3AZgmcG%60~%5Bo%2A%5EP@34.35.76.77:5432/vista_travel?sslmode=no-verify',
    NEXTAUTH_SECRET: 'vista-travel-secret-key-change-in-production-2024',
    NEXTAUTH_URL: 'http://localhost:3000',
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
