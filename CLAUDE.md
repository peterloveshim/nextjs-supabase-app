# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js와 Supabase를 기반으로 한 스타터 킷이다. 쿠키 기반 Supabase Auth를 구성하여 클라이언트 컴포넌트, 서버 컴포넌트, Route Handler, Server Action, Proxy(미들웨어) 등 Next.js 전체 스택에서 사용자 세션을 공유한다.

**기술 스택**

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 백엔드/인증 | Supabase (`@supabase/ssr`) |
| UI | shadcn/ui (new-york 스타일), Tailwind CSS |
| 테마 | next-themes (다크/라이트 모드) |
| 아이콘 | lucide-react |

**주요 기능**

- 이메일/비밀번호 기반 인증 (회원가입, 로그인, 비밀번호 재설정)
- 이메일 OTP 인증 콜백 처리
- 인증 상태에 따른 라우트 보호 (proxy 미들웨어)
- 다크/라이트 테마 전환

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## 환경 변수

`.env.local` 파일에 다음 변수가 필요하다:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`lib/utils.ts`의 `hasEnvVars`로 환경 변수 설정 여부를 확인한다. 미설정 시 인증 관련 UI가 경고 상태로 표시된다.

## 아키텍처

### 라우팅 구조

- `/` — 공개 랜딩 페이지
- `/auth/*` — 인증 페이지 (로그인, 회원가입, 비밀번호 재설정 등)
- `/protected/*` — 인증 필수 페이지 (`app/protected/layout.tsx`에 네비게이션 포함)

### Supabase 클라이언트 패턴

Supabase 클라이언트는 사용 컨텍스트에 따라 두 가지로 구분된다:

- **서버 컴포넌트 / Route Handler**: `lib/supabase/server.ts`의 `createClient()` (async, cookies 기반)
- **클라이언트 컴포넌트**: `lib/supabase/client.ts`의 `createClient()` (브라우저 기반)

> Fluid compute 환경에서는 서버 클라이언트를 전역 변수에 저장하지 말고, 함수 호출마다 새로 생성해야 한다.

### 인증 미들웨어

`proxy.ts` (Next.js proxy 파일) → `lib/supabase/proxy.ts`의 `updateSession()`을 호출한다. 이 함수가:

1. 요청마다 Supabase 세션을 갱신한다
2. 비인증 사용자가 `/auth`, `/` 외 경로에 접근하면 `/auth/login`으로 리다이렉트한다

이 파일은 `middleware.ts` 대신 `proxy.ts`라는 이름을 사용한다 (Next.js 15.3+ Fluid compute 패턴).

### 이메일 인증 콜백

`/auth/confirm` Route Handler가 이메일 OTP 검증을 처리한다. Supabase의 이메일 인증 링크는 이 경로로 리다이렉트된다.

### shadcn/ui 설정

- 스타일: `new-york`
- 베이스 컬러: `neutral`
- CSS 변수 방식 사용
- 아이콘: `lucide-react`

shadcn 컴포넌트 추가 시: `npx shadcn@latest add [컴포넌트명]`

## 주요 패턴

- 인증 상태 확인은 `supabase.auth.getClaims()` 사용 (`getUser()` 아님)
- 테마는 `next-themes`의 `ThemeProvider`로 관리 (루트 레이아웃에 설정됨)
- 경로 별칭: `@/components`, `@/lib`, `@/hooks`
