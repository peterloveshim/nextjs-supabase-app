import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents는 usePathname 등 동적 클라이언트 훅과 충돌하여 비활성화
  // cacheComponents: true,
};

export default nextConfig;
