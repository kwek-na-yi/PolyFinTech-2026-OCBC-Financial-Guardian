/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server build for a lean Docker image.
  output: "standalone",
};

module.exports = nextConfig;
