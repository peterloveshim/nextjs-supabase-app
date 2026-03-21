import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/protected/events", label: "이벤트" },
  { href: "/protected/notifications", label: "알림" },
];

export function LandingHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold">
          모임이음
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
