"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * 구글 로고 SVG 아이콘 컴포넌트
 * 공식 구글 브랜드 색상을 사용한다.
 */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface GoogleLoginButtonProps {
  /** 버튼에 표시할 텍스트 (기본값: "Google로 계속하기") */
  label?: string;
  /** 로그인 성공 후 이동할 경로 (인코딩된 URL) */
  redirectTo?: string;
}

/**
 * Google OAuth 로그인 버튼 컴포넌트
 * 클릭 시 Supabase OAuth 플로우를 시작하고 /auth/callback으로 리다이렉트된다.
 * redirectTo가 있으면 OAuth 콜백의 next 파라미터로 전달한다.
 */
export function GoogleLoginButton({
  label = "Google로 계속하기",
  redirectTo,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      // redirectTo가 있으면 OAuth 콜백에 next 파라미터로 포함
      const callbackUrl = redirectTo
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(decodeURIComponent(redirectTo))}`
        : `${window.location.origin}/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // OAuth 인증 완료 후 돌아올 콜백 URL
          redirectTo: callbackUrl,
        },
      });
      // signInWithOAuth는 브라우저를 Google 로그인 페이지로 리다이렉트하므로
      // 이후 코드는 실행되지 않는다.
    } catch {
      // 예외적인 경우에만 로딩 상태를 해제한다.
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        // 로딩 중 스피너 표시
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <GoogleIcon />
      )}
      {isLoading ? "연결 중..." : label}
    </Button>
  );
}
