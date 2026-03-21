import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents는 usePathname 등 동적 클라이언트 훅과 충돌하여 비활성화
  // cacheComponents: true,
  images: {
    // 사용자가 임의 URL을 입력하므로 모든 외부 도메인 허용
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
