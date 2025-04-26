/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  },
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: 
          process.env.NODE_ENV === "development"
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/py/:path*`
            : "/api/py/:path*",
      },
      {
        source: "/api/auth/token",
        destination: 
          process.env.NODE_ENV === "development"
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/py/auth/token`
            : "/api/py/auth/token",
      }
    ];
  },
  
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};

module.exports = nextConfig;