import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Google OAuth 콜백 처리 Route Handler
 * Supabase가 OAuth 인증 후 code 파라미터와 함께 이 경로로 리다이렉트한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Google OAuth에서 전달받은 인증 코드
  const code = searchParams.get("code");
  // 인증 성공 후 이동할 경로 (기본값: /protected/events)
  const next = searchParams.get("next") ?? "/protected/events";

  if (code) {
    const supabase = await createClient();

    // 인증 코드를 세션으로 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 시 보호된 페이지로 이동
      redirect(next);
    } else {
      // 인증 실패 시 에러 페이지로 이동
      redirect(`/auth/error?error=${error.message}`);
    }
  }

  // code 파라미터가 없는 경우 에러 처리
  redirect("/auth/error?error=OAuth 콜백에 인증 코드가 없습니다");
}
