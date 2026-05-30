import type { NextConfig } from 'next';
import path from 'path';
import { getBackendInternalUrl } from './src/lib/env-config';

const backendInternalUrl = getBackendInternalUrl();

if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_INTERNAL_URL) {
  console.warn(
    '[next.config] BACKEND_INTERNAL_URL이 없습니다. Vercel Settings에 Render API URL을 설정하세요. 현재 rewrite 대상:',
    backendInternalUrl,
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    optimizePackageImports: ['react', 'react-dom', 'lucide-react'],
  },
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${backendInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
