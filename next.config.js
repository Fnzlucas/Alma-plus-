/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/alma-plus-landing.html',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
