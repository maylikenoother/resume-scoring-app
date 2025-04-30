
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000'
  },
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: "http://localhost:8000/api/py/:path*"
      }
    ];
  }
};

module.exports = nextConfig;