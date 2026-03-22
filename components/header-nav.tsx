"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/protected/events", label: "이벤트" },
  { href: "/protected/notifications", label: "알림" },
  { href: "/protected/profile", label: "프로필" },
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
            "hover:text-foreground text-sm font-medium transition-colors",
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

export function HeaderNav({ email }: { email?: string }) {
  const router = useRouter();
  const isLoggedIn = !!email;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold">
          모임이음
        </Link>

        {/* 데스크톱 네비게이션 */}
        <NavLinks className="hidden items-center gap-6 md:flex" />

        {/* 우측 액션 영역 */}
        <div className="flex items-center gap-2">
          {/* 테마 토글 버튼 */}
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {/* 알림 아이콘 */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/protected/notifications" aria-label="알림">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>

              {/* 이메일 드롭다운 (md 이상에서 표시) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hidden h-auto px-2 py-1 text-sm md:flex"
                  >
                    {email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/protected/profile">
                      <User className="h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                  {/* 모바일 이메일 + 로그아웃 */}
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-3">
                    <span className="text-muted-foreground truncate text-sm">
                      {email}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            /* 비로그인 상태: 로그인/회원가입 버튼 */
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="hidden md:flex"
              >
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:flex">
                <Link href="/auth/sign-up">회원가입</Link>
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
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/auth/login">로그인</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/auth/sign-up">회원가입</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
