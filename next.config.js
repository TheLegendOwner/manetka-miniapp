// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['t.me', 'telegram.org'], // уже были
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://beethelegends.publicvm.com/api/:path*'
      },
      {
        source: '/auth',
        destination: 'https://beethelegends.publicvm.com/auth'
      }
    ];
  }
};

module.exports = nextConfig;
