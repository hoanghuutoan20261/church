/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.vietqr.io", "images.unsplash.com"],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    return [
      {
        source: "/live/:path*",
        destination: "http://127.0.0.1:8888/live/:path*",
      },
    ];
  },
};

export default nextConfig;
