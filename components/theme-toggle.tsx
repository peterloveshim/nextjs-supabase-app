"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * 라이트/다크 모드 토글 버튼 컴포넌트
 * - 현재 테마가 dark이면 Sun 아이콘(라이트로 전환), 그 외에는 Moon 아이콘(다크로 전환) 표시
 * - 하이드레이션 불일치 방지를 위해 마운트 이후에만 렌더링
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // 클라이언트 마운트 이후에만 테마 UI를 렌더링하여 하이드레이션 이슈 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 전에는 동일한 크기의 빈 버튼으로 레이아웃 자리 유지
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="테마 전환"
        disabled
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={handleToggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        // 다크 모드 상태 -> 라이트로 전환하는 Sun 아이콘 표시
        <Sun className="text-muted-foreground h-4 w-4 transition-all" />
      ) : (
        // 라이트 모드 상태 -> 다크로 전환하는 Moon 아이콘 표시
        <Moon className="text-muted-foreground h-4 w-4 transition-all" />
      )}
    </Button>
  );
}
