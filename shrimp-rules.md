# Development Guidelines

## 프로젝트 개요

Next.js (App Router) + Supabase 기반 스타터 킷. 쿠키 기반 인증으로 서버/클라이언트 전체 스택에서 세션 공유.

| 항목        | 값                                        |
| ----------- | ----------------------------------------- |
| 프레임워크  | Next.js 16+ (App Router), React 19        |
| 백엔드/인증 | Supabase (`@supabase/ssr`)                |
| UI          | shadcn/ui (new-york 스타일), Tailwind CSS |
| 언어        | TypeScript (strict)                       |
| 아이콘      | lucide-react                              |
| 테마        | next-themes                               |

---

## 디렉토리 구조 및 역할

```
app/                   # Next.js App Router 페이지
  auth/                # 인증 페이지 (공개)
    confirm/route.ts   # 이메일 OTP 검증 Route Handler
    callback/route.ts  # OAuth 콜백
    login/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    update-password/page.tsx
  protected/           # 인증 필수 페이지
    layout.tsx         # 네비게이션 포함
    page.tsx
  layout.tsx           # 루트 레이아웃 (ThemeProvider)
  page.tsx             # 공개 랜딩 페이지

components/            # 공통 컴포넌트
  ui/                  # shadcn/ui 컴포넌트 (직접 수정 금지 원칙)
  auth-button.tsx      # 인증 상태 버튼
  login-form.tsx       # 로그인 폼
  sign-up-form.tsx     # 회원가입 폼
  ...

hooks/                 # 커스텀 훅
lib/
  supabase/
    client.ts          # 브라우저 클라이언트
    server.ts          # 서버 클라이언트 (async)
    proxy.ts           # 미들웨어 세션 갱신 로직
  utils.ts             # hasEnvVars 등 유틸

types/
  database.types.ts    # Supabase 자동 생성 DB 타입 (직접 수정 금지)

proxy.ts               # Next.js Fluid compute 미들웨어 진입점 (middleware.ts 아님)
```

---

## Supabase 클라이언트 사용 규칙

### 클라이언트 선택

| 컨텍스트                                    | 사용할 파일              | import                                                 |
| ------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| 서버 컴포넌트, Route Handler, Server Action | `lib/supabase/server.ts` | `import { createClient } from "@/lib/supabase/server"` |
| 클라이언트 컴포넌트 (`"use client"`)        | `lib/supabase/client.ts` | `import { createClient } from "@/lib/supabase/client"` |

### 필수 규칙

- **서버 클라이언트를 전역 변수에 저장하지 않는다** (Fluid compute 환경 — 매 함수 호출마다 새로 생성)
- 인증 확인은 반드시 `supabase.auth.getClaims()` 사용 (`getUser()` 사용 금지)
- `getClaims()` 호출과 `createServerClient()` 사이에 다른 코드를 삽입하지 않는다

```ts
// 올바른 서버 컴포넌트 패턴
export default async function Page() {
  const supabase = await createClient(); // lib/supabase/server.ts
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  // ...
}
```

---

## 미들웨어 규칙

- **미들웨어 파일은 `proxy.ts`** (루트에 위치) — `middleware.ts` 파일 생성 금지
- `proxy.ts`는 `lib/supabase/proxy.ts`의 `updateSession()`만 호출
- 인증 리다이렉트 로직은 `lib/supabase/proxy.ts`에서만 수정
- 공개 경로: `/`, `/auth/*` — 그 외 미인증 접근 시 `/auth/login`으로 리다이렉트
- `proxy.ts`의 `config.matcher`를 수정하여 정적 파일 제외 경로를 조정

---

## 타입 시스템 규칙

- **`any` 타입 사용 절대 금지**
- DB 타입은 `types/database.types.ts`에서 import (직접 수정 금지 — `npx supabase gen types` 재생성)
- 편의 타입 별칭 사용:
  ```ts
  import {
    type Profile,
    type ProfileInsert,
    type ProfileUpdate,
  } from "@/types/database.types";
  ```
- 새 테이블 추가 시 `mcp__supabase__generate_typescript_types`로 `types/database.types.ts` 재생성 후 하단에 편의 타입 추가

---

## 컴포넌트 작성 규칙

### 기본 원칙

- Server Component 우선, 상호작용 필요 시에만 `"use client"` 추가
- 컴포넌트당 단일 책임, 300줄 이하 유지
- Props는 반드시 TypeScript interface로 정의

### shadcn/ui 컴포넌트

- 추가: `npx shadcn@latest add [컴포넌트명]`
- `components/ui/` 파일은 직접 수정하지 않는 것을 원칙으로 함
- shadcn 설정: new-york 스타일, neutral 베이스 컬러, CSS 변수 방식

### 클래스 병합

```ts
import { cn } from "@/lib/utils"; // cn()으로 Tailwind 클래스 병합
```

### 폼 구현

- React Hook Form + Zod 조합 사용
- Server Action과 함께 사용할 경우 `useActionState` 활용

---

## 라우팅 및 경로 보호

### 경로 분류

| 경로           | 접근      | 설명                      |
| -------------- | --------- | ------------------------- |
| `/`            | 공개      | 랜딩 페이지               |
| `/auth/*`      | 공개      | 인증 관련 페이지          |
| `/protected/*` | 인증 필수 | 미인증 시 자동 리다이렉트 |

### 새 보호 경로 추가

- `app/protected/` 하위에 페이지 추가하면 자동으로 인증 보호됨
- 별도의 미들웨어 수정 불필요

---

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- `lib/utils.ts`의 `hasEnvVars`로 환경 변수 설정 여부 확인
- 환경 변수 미설정 시 인증 UI가 경고 상태로 표시됨 (`EnvVarWarning` 컴포넌트)
- `.env.local`에 설정, `.env.example`에 키 목록 유지

---

## 스타일링 규칙

- Tailwind CSS만 사용 (인라인 스타일 금지)
- 반응형 필수 (`sm:`, `md:`, `lg:` 프리픽스 활용)
- 다크모드 지원 (`dark:` 프리픽스, ThemeProvider가 루트에 설정됨)
- CSS 변수 방식 (`--foreground`, `--background` 등) — `app/globals.css`에 정의

---

## 코드 품질 규칙

### 네이밍

- 변수/함수: camelCase
- 컴포넌트: PascalCase
- 파일: kebab-case (컴포넌트 파일도 동일)

### 언어

- 코드 주석: 한국어
- 커밋 메시지: 한국어 + 이모지 컨벤셔널 커밋
- 문서: 한국어

### 금지 사항

- `any` 타입 사용 금지
- `middleware.ts` 파일 생성 금지 (proxy.ts 사용)
- Supabase 서버 클라이언트 전역 변수 저장 금지
- `supabase.auth.getUser()` 사용 금지 (getClaims() 사용)
- `components/ui/` 직접 수정 금지 (shadcn 재설치 시 덮어씌워짐)

---

## Git 훅 (자동 실행)

| 훅         | 실행 내용                                    |
| ---------- | -------------------------------------------- |
| pre-commit | lint-staged: ESLint 자동수정 + Prettier 포맷 |
| pre-push   | `tsc --noEmit` 전체 타입 검사                |

- 타입 오류 시 push 차단됨 — 반드시 타입 오류 해결 후 push

---

## 데이터베이스

### 현재 테이블

| 테이블     | 설명                                                            |
| ---------- | --------------------------------------------------------------- |
| `profiles` | 사용자 프로필 (id, email, full_name, username, avatar_url, bio) |

### 마이그레이션

- `mcp__supabase__apply_migration`으로 마이그레이션 실행
- 테이블 변경 후 반드시 `mcp__supabase__generate_typescript_types`로 `types/database.types.ts` 재생성
- `types/database.types.ts` 하단 편의 타입 섹션 수동 유지

---

## 다중 파일 동시 수정 규칙

| 작업                    | 함께 수정해야 할 파일                             |
| ----------------------- | ------------------------------------------------- |
| DB 테이블 추가/변경     | `types/database.types.ts` 재생성 필수             |
| 새 shadcn 컴포넌트 추가 | `components/ui/` (자동), `components.json` (자동) |
| 환경 변수 추가          | `.env.local`, `.env.example` 동시 업데이트        |
| 새 공개 경로 추가       | `lib/supabase/proxy.ts`의 리다이렉트 조건 수정    |

---

## AI 의사결정 기준

### 컴포넌트 위치 결정

```
shadcn UI 원본 컴포넌트? → components/ui/
재사용 가능한 공통 컴포넌트? → components/
특정 기능 전용 컴포넌트? → 해당 기능 폴더 하위 (예: app/protected/_components/)
커스텀 훅? → hooks/
```

### Server vs Client Component 결정

```
데이터 패칭 필요? → Server Component
useState/useEffect 필요? → Client Component
이벤트 핸들러 필요? → Client Component
Supabase 인증 확인? → Server Component (lib/supabase/server.ts)
Supabase 실시간? → Client Component (lib/supabase/client.ts)
```

### 새 페이지 추가 결정

```
인증 없이 접근 가능? → app/ 하위 (proxy.ts에 공개 경로 추가 필요할 수 있음)
인증 필수? → app/protected/ 하위 (자동 보호)
인증 관련 페이지? → app/auth/ 하위
```
