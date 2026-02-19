/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: 'export',
  basePath: '/auditor-esg-platform',
  images: { unoptimized: true },
  trailingSlash: true,
}
module.exports = nextConfig
