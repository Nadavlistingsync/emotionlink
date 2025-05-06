/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  basePath: '',
  assetPrefix: '',
};

module.exports = nextConfig; 