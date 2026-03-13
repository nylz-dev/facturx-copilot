/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  experimental: {},
};

module.exports = nextConfig;
