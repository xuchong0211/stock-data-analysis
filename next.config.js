/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/users",
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["examcard.oss-cn-hangzhou.aliyuncs.com"],
  },
  experimental: {
    outputStandalone: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
