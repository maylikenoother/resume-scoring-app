/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://cv-review-app-backend.onrender.com'
  },
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://cv-review-app-backend.onrender.com'}/api/py/:path*`
      }
    ];
  }
};

module.exports = nextConfig;