/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/alma-plus-landing.html',
      },
    ]
  },
}

module.exports = nextConfig
