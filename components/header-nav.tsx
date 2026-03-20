"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/protected/events", label: "이벤트" },
  { href: "/protected/notifications", label: "알림" },
];

function NavLinks({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname.startsWith(link.href)
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/protected/events" className="text-lg font-bold">
          모임이음
        </Link>

        {/* 데스크톱 네비게이션 */}
        <NavLinks className="hidden items-center gap-6 md:flex" />

        {/* 우측 액션 영역 */}
        <div className="flex items-center gap-2">
          {/* 알림 아이콘 */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/protected/notifications" aria-label="알림">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          {/* 모바일 햄버거 메뉴 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="메뉴"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>모임이음</SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <NavLinks className="flex flex-col gap-4" />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
