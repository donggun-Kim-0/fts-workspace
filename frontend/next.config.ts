import type { NextConfig } from 'next';
import path from 'path';

/** NestJS API URL — rewrite 대상 (절대 `/backend` 같은 상대 경로 사용 금지) */
function getBackendInternalUrl(): string {
  const url = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, '');
  if (url && /^https?:\/\//i.test(url)) return url;
  return 'http://127.0.0.1:4000';
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    optimizePackageImports: ['react', 'react-dom', 'lucide-react'],
  },
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = getBackendInternalUrl();
    return [
      {
        source: '/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
