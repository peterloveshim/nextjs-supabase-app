"use client";

import { Bell, CalendarDays, LogOut, Menu, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
        {/* 로고 — 이벤트 목록으로 이동 */}
        <Link href="/protected/events" className="text-lg font-bold">
          모임이음
        </Link>

        {/* 우측 액션 영역 */}
        <div className="flex items-center gap-2">
          {/* 테마 토글 버튼 */}
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {/* 이메일 드롭다운 (md 이상) — 이벤트·알림·프로필·로그아웃 */}
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
                    <Link href="/protected/events">
                      <CalendarDays className="h-4 w-4" />
                      이벤트
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href="/protected/notifications">
                      <Bell className="h-4 w-4" />
                      알림
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                  {/* 모바일 네비게이션 */}
                  <nav className="flex flex-col gap-4">
                    <Link
                      href="/protected/events"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <CalendarDays className="h-4 w-4" />
                      이벤트
                    </Link>
                    <Link
                      href="/protected/notifications"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      알림
                    </Link>
                    <Link
                      href="/protected/profile"
                      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <User className="h-4 w-4" />
                      프로필
                    </Link>
                  </nav>
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
