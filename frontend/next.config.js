/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    // INTERNAL_API_URL = container-to-container (http://backend:8004)
    // Falls back to localhost for local npm run dev
    const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:8004";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
