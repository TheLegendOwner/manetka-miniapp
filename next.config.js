const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['t.me', 'telegram.org', 'tonapi.io', 'cache.tonapi.io'], // уже были
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
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'clipboard-write=(self)',
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;