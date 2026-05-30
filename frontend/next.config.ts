import type { NextConfig } from 'next';
import path from 'path';

/**
 * 프록시 설정:
 * 외부 접속(터널링) 환경에서도 백엔드 API를 올바르게 찾을 수 있도록 설정합니다.
 */
const getBackendUrl = () => {
  // 1. 서버 환경변수(운영) 혹은 퍼블릭 환경변수 사용
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    optimizePackageImports: ['react', 'react-dom', 'lucide-react'],
  },
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = getBackendUrl();
    
    // API 프록시 설정
    // 프론트엔드에서 /backend로 요청을 보내면 백엔드(Render/로컬)로 전달
    return [
      {
        source: '/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;