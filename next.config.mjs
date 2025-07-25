/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add headers to help with external script loading
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://imasdk.googleapis.com https://www.googletagservices.com; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
