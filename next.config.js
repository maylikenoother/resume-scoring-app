/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  },
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: process.env.NODE_ENV === 'development' 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/py/:path*` 
          : "/api/py/:path*"
      }
    ];
  },
};

module.exports = nextConfig;