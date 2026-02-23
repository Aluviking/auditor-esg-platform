/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  devIndicators: false,
  images: { unoptimized: true },
  ...(isProd && {
    output: 'export',
    basePath: '/auditor-esg-platform',
    trailingSlash: true,
  }),
}

module.exports = nextConfig
