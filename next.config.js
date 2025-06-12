/** @type {import('next').NextConfig} */
const nextConfig = {

};

module.exports = {
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
    ]
  },
}
module.exports = {
  images: {
    domains: ['t.me', 'telegram.org'], // добавь нужный
  },
};