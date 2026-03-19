# Next.js 16.2.0 개발 지침

이 문서는 Claude Code에서 Next.js 16.2.0 프로젝트를 개발할 때 따라야 할 핵심 규칙과 가이드라인을 제공합니다.

## 🚀 필수 규칙 (엄격 준수)

### App Router 아키텍처

```typescript
// ✅ 올바른 방법: App Router 사용
app/
├── layout.tsx          // 루트 레이아웃
├── page.tsx           // 메인 페이지
├── loading.tsx        // 로딩 UI
├── error.tsx          // 에러 UI
├── not-found.tsx      // 404 페이지
└── dashboard/
    ├── layout.tsx     // 대시보드 레이아웃
    └── page.tsx       // 대시보드 페이지

// ❌ 금지: Pages Router 사용
pages/
├── index.tsx
└── dashboard.tsx
```

### Server Components 우선 설계

```typescript
// 🚀 필수: 기본적으로 모든 컴포넌트는 Server Components
export default async function UserDashboard() {
  // 서버에서 데이터 가져오기
  const user = await getUser()

  return (
    <div>
      <h1>{user.name}님의 대시보드</h1>
      {/* 클라이언트 컴포넌트가 필요한 경우에만 분리 */}
      <InteractiveChart data={user.analytics} />
    </div>
  )
}

// ✅ 클라이언트 컴포넌트는 최소한으로 사용
'use client'

import { useState } from 'react'

export function InteractiveChart({ data }: { data: Analytics[] }) {
  const [selectedRange, setSelectedRange] = useState('week')
  // 상호작용 로직만 클라이언트에서 처리
  return <Chart data={data} range={selectedRange} />
}
```

### 🔴 Breaking Change: async request APIs 완전 제거

Next.js 16에서 request APIs의 **동기식 접근이 완전히 제거**되었습니다. (15.x에서 deprecated → 16.x에서 완전 삭제)

영향을 받는 API: `cookies`, `headers`, `draftMode`, `params`, `searchParams`

```typescript
// ✅ 필수: 모든 request APIs는 반드시 await 사용
import { cookies, headers } from 'next/headers'

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 🔴 필수: 모든 request API는 반드시 async/await 처리
  const { id } = await params
  const query = await searchParams
  const cookieStore = await cookies()
  const headersList = await headers()

  const user = await getUser(id)

  return <UserProfile user={user} />
}

// ❌ 절대 금지: 동기식 접근 (16.x에서 런타임 에러 발생)
export default function Page({ params }: { params: { id: string } }) {
  const user = getUser(params.id) // 에러 발생
  return <UserProfile user={user} />
}
```

### Server Component 환경 변수 직접 접근

```typescript
// ✅ Next.js 16: Server Component에서 서버 전용 환경 변수 직접 접근 가능
// serverRuntimeConfig 대체
async function fetchData() {
  const dbUrl = process.env.DATABASE_URL // 서버 전용 env 변수
  return await db.query(dbUrl, 'SELECT * FROM users')
}

export default async function Page() {
  const data = await fetchData()
  return <div>{/* 데이터 렌더링 */}</div>
}
```

### Typed Routes 활용

```typescript
// 🚀 필수: Typed Routes로 타입 안전성 보장
import Link from 'next/link'

// next.config.ts에서 experimental.typedRoutes: true 설정 필요
export function Navigation() {
  return (
    <nav>
      {/* ✅ 타입 안전한 링크 */}
      <Link href="/dashboard/users/123">사용자 상세</Link>
      <Link href={{
        pathname: '/products/[id]',
        params: { id: 'abc' }
      }}>제품 상세</Link>

      {/* ❌ 컴파일 에러: 존재하지 않는 경로 */}
      <Link href="/nonexistent-route">잘못된 링크</Link>
    </nav>
  )
}
```

## ✅ 권장 사항 (성능 최적화)

### Streaming과 Suspense 활용

```typescript
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>대시보드</h1>

      {/* ✅ 빠른 컨텐츠는 즉시 렌더링 */}
      <QuickStats />

      {/* ✅ 느린 컨텐츠는 Suspense로 감싸기 */}
      <Suspense fallback={<SkeletonChart />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<SkeletonTable />}>
        <SlowDataTable />
      </Suspense>
    </div>
  )
}

async function SlowChart() {
  const data = await getComplexAnalytics()
  return <Chart data={data} />
}
```

### after() API 활용

```typescript
import { after } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // 즉시 응답 반환
  const result = await processUserData(body);

  // 비블로킹 작업은 after()로 처리
  after(async () => {
    await sendAnalytics(result);
    await updateCache(result.id);
    await sendNotification(result.userId);
  });

  return Response.json({ success: true, id: result.id });
}
```

### 🔄 New: updateTag API (Server Actions 전용)

`updateTag`는 Server Actions 전용 API로 **읽기-쓰기 일관성(read-your-writes)** 을 보장합니다.
같은 요청 내에서 캐시를 만료시키고 즉시 갱신합니다.

```typescript
"use server";

import { updateTag } from "next/cache";

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);

  // 캐시 만료 후 즉시 갱신 (revalidateTag와 달리 동일 요청 내 반영)
  updateTag(`user-${userId}`);
}
```

### 캐싱 전략

```typescript
// ✅ 세밀한 캐시 제어
export async function getProductData(id: string) {
  // 정적 데이터 (무기한 캐시)
  const staticData = await fetch(`/api/products/${id}`, {
    cache: "force-cache",
  });

  // 동적 데이터 (캐시 없음)
  const dynamicData = await fetch(`/api/products/${id}/stock`, {
    cache: "no-store",
  });

  // 시간 기반 재검증
  const revalidatedData = await fetch(`/api/products/${id}`, {
    next: {
      revalidate: 3600, // 1시간 캐시
      tags: [`product-${id}`, "products"],
    },
  });

  return revalidatedData.json();
}

// 태그 기반 캐시 무효화
import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: ProductData) {
  await updateDatabase(id, data);

  revalidateTag(`product-${id}`);
  revalidateTag("products");
}
```

### 🔄 New: connection() API - 런타임 환경 변수 보장

빌드 타임이 아닌 **런타임에 환경 변수**를 읽어야 할 때 사용합니다.

```typescript
import { connection } from 'next/server'

export default async function Page() {
  // connection() 호출로 런타임 환경 변수 접근 보장
  await connection()
  const config = process.env.RUNTIME_CONFIG

  return <p>{config}</p>
}
```

### 🔄 New: View Transitions API (실험적)

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true, // View Transitions API 통합 활성화
    typedRoutes: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "lodash-es",
    ],
  },
};

export default nextConfig;
```

### Turbopack 설정 (최상위 레벨로 이동)

```typescript
// next.config.ts
// ⚠️ Breaking Change: experimental.turbo → 최상위 turbopack으로 변경
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Next.js 16: turbopack이 최상위 설정으로 승격
  turbopack: {
    rules: {
      "*.module.css": {
        loaders: ["css-loader"],
        as: "css",
      },
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
```

## ⚠️ Breaking Changes 대응

### React 19 호환성

```typescript
// ✅ useFormStatus 훅 사용
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '제출 중...' : '제출'}
    </button>
  )
}

// ✅ Server Actions와 form 통합
export async function createUser(formData: FormData) {
  'use server'

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  await saveUser({ name, email })
  redirect('/users')
}

export default function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <SubmitButton />
    </form>
  )
}
```

### 미들웨어 Node.js Runtime

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Node.js Runtime이 기본값으로 안정화
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### 🔄 unauthorized / forbidden API 변경

```typescript
// ⚠️ Breaking Change: next/server → next/navigation으로 import 변경

// ✅ Next.js 16: next/navigation에서 import
import { forbidden } from 'next/navigation'
import { verifySession } from '@/app/lib/dal'

export default async function AdminPage() {
  const session = await verifySession()

  if (!session) {
    // unauthorized()는 next/navigation에서 import
    const { unauthorized } = await import('next/navigation')
    unauthorized()
  }

  if (session.role !== 'admin') {
    forbidden() // 403 페이지 렌더링
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
    </main>
  )
}
```

### Route Segment Runtime 설정

```typescript
// app/api/heavy-task/route.ts
// 기본값은 'nodejs', 필요시 'edge' 선택
export const runtime = "nodejs"; // 'nodejs' | 'edge'

// ⚠️ 'edge' 런타임은 Cache Components와 호환되지 않음
export const runtime = "edge"; // Cache Components 사용 불가
```

## 🔄 New Features 활용

### Route Groups 고급 패턴

```typescript
// ✅ Route Groups로 레이아웃 분리
app/
├── (marketing)/
│   ├── layout.tsx     // 마케팅 레이아웃
│   ├── page.tsx       // 홈페이지
│   └── about/
│       └── page.tsx   // 소개 페이지
├── (dashboard)/
│   ├── layout.tsx     // 대시보드 레이아웃
│   └── analytics/
│       └── page.tsx   // 분석 페이지
└── (auth)/
    ├── login/
    │   └── page.tsx
    └── register/
        └── page.tsx

// (marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
```

### Parallel Routes 활용

```typescript
// ✅ Parallel Routes로 동시 렌더링
app/
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── @analytics/
│   │   └── page.tsx
│   └── @notifications/
│       └── page.tsx

// dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  notifications,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside className="analytics-panel">
        <Suspense fallback={<AnalyticsSkeleton />}>
          {analytics}
        </Suspense>
      </aside>
      <div className="notifications-panel">
        <Suspense fallback={<NotificationsSkeleton />}>
          {notifications}
        </Suspense>
      </div>
    </div>
  )
}
```

### Intercepting Routes

```typescript
// ✅ Intercepting Routes로 모달 구현
app/
├── gallery/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx    // 전체 페이지 보기
└── @modal/
    └── (.)gallery/
        └── [id]/
            └── page.tsx // 모달 보기

// @modal/(.)gallery/[id]/page.tsx
import { Modal } from '@/components/modal'

export default async function PhotoModal({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  )
}
```

## ❌ 금지 사항

### Pages Router 사용 금지

```typescript
// ❌ 절대 금지: Pages Router 패턴
pages/
├── _app.tsx
├── _document.tsx
├── index.tsx
└── api/
    └── users.ts

// ❌ 금지: getServerSideProps, getStaticProps 사용
export async function getServerSideProps() {
  // 이 방식은 사용하지 마세요
}
```

### 안티패턴 방지

```typescript
// ❌ 금지: 불필요한 'use client' 사용
'use client'

export default function SimpleComponent({ title }: { title: string }) {
  // 상태나 이벤트 핸들러가 없는데 'use client' 사용
  return <h1>{title}</h1>
}

// ✅ 올바른 방법: Server Component로 유지
export default function SimpleComponent({ title }: { title: string }) {
  return <h1>{title}</h1>
}

// ❌ 금지: 클라이언트에서 서버 함수 직접 호출
'use client'

import { getUser } from '@/lib/database' // 서버 전용 함수

export function UserProfile() {
  const user = getUser() // 에러 발생
  return <div>{user.name}</div>
}

// ✅ 올바른 방법: 서버에서 데이터 전달
export default async function UserPage() {
  const user = await getUser()
  return <UserProfile user={user} />
}

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>
}

// ❌ 금지: experimental.turbo 사용 (16.x에서 제거됨)
const nextConfig = {
  experimental: {
    turbo: { ... } // 에러 발생
  }
}

// ✅ 올바른 방법: 최상위 turbopack 사용
const nextConfig = {
  turbopack: { ... }
}
```

## 코드 품질 체크리스트

개발 완료 후 다음 명령어들을 반드시 실행하세요:

```bash
# 🚀 필수: 타입 체크
npm run typecheck

# 🚀 필수: 린트 검사
npm run lint

# ✅ 권장: 포맷 검사
npm run format:check

# 🚀 필수: 통합 검사
npm run check-all

# 🚀 필수: 빌드 테스트
npm run build
```

## Next.js 16 → 16 주요 변경 요약

| 항목                       | Next.js 16               | Next.js 16                                      |
| -------------------------- | ------------------------ | ----------------------------------------------- |
| Async Request APIs         | deprecated (동기식 경고) | **완전 제거** (동기식 런타임 에러)              |
| Turbopack 설정             | `experimental.turbo`     | **최상위 `turbopack`**                          |
| `unauthorized`/`forbidden` | `next/server`            | **`next/navigation`**                           |
| 서버 환경 변수             | `serverRuntimeConfig`    | **Server Component 직접 접근**                  |
| 새로운 API                 | `after()`                | `updateTag()`, `connection()` 추가              |
| View Transitions           | 미지원                   | **실험적 지원** (`experimental.viewTransition`) |

이 지침을 따라 Next.js 16.2.0의 모든 기능을 최대한 활용하여 현대적이고 성능 최적화된 애플리케이션을 개발하세요.
