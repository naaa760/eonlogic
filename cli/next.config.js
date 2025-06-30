/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      loaders: {
        // Add custom loaders if needed
      },
    },
  },
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  },
  images: {
    domains: [
      "localhost",
      "img.clerk.com",
      "images.clerk.dev",
      "www.gravatar.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
