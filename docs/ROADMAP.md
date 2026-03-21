# 모임 & 이벤트 관리 웹 MVP 개발 로드맵

소규모 지인 모임의 주최자가 공지, 참여자 관리, 카풀, 정산을 한 곳에서 처리할 수 있는 웹 애플리케이션

## 개요

모임 & 이벤트 관리 웹 MVP는 10~30명 규모의 소규모 지인 모임(수영, 헬스, 친구 모임 등) 주최자와 참여자를 위한 올인원 모임 관리 서비스로 다음 기능을 제공합니다:

- **이벤트 CRUD + 참여자 관리**: 이벤트 생성/수정/삭제, 링크 공유를 통한 참여 신청, 승인/거절 처리
- **공지 + 카풀**: 이벤트별 공지 작성/열람, 카풀 드라이버 등록 및 탑승 신청
- **정산 + 웹 알림**: 1/N 자동 정산, 납부 여부 관리, Supabase Realtime 기반 실시간 알림

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `012`라면 `011`과 `010`을 예시로 참조.
   - 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함 (체크된 박스와 변경 사항 요약). 새 작업의 경우, 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조.

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 체크 표시로 변경

## 기술 스택

| 분류            | 기술                                       |
| --------------- | ------------------------------------------ |
| 프레임워크      | Next.js 16 (App Router), React 19          |
| 언어            | TypeScript 5.6+                            |
| 스타일링        | TailwindCSS v4, shadcn/ui (new-york)       |
| 아이콘          | Lucide React                               |
| 테마            | next-themes                                |
| 폼/검증         | React Hook Form 7.x + Zod                  |
| 서버 상태       | TanStack Query v5                          |
| 클라이언트 상태 | Zustand                                    |
| URL 상태        | nuqs                                       |
| 백엔드/인증/DB  | Supabase (PostgreSQL, Auth, Realtime, RLS) |
| 배포            | Vercel                                     |

## 기존 구현 현황

프로젝트는 Next.js + Supabase 스타터 킷을 기반으로 다음 기능이 이미 구현되어 있습니다:

- 이메일/비밀번호 기반 인증 (회원가입, 로그인, 비밀번호 재설정)
- Google OAuth 소셜 로그인
- 이메일 OTP 인증 콜백 처리
- 인증 상태에 따른 라우트 보호 (proxy 미들웨어)
- 다크/라이트 테마 전환
- 기본 protected 라우트 구조 (`/protected`)

---

## 개발 원칙

> **UI-first 전략**: 각 Phase에서 Mock 데이터로 UI/UX를 먼저 구현하고 디자인을 검토한 후, DB 연동을 진행한다.
> 디자인 변경 비용을 최소화하고 빠른 시각적 피드백을 확보하기 위함이다.

---

## 개발 단계

### Phase 1: 이벤트 CRUD + 참여자 관리 (핵심 루프) ✅

#### 1-A: UI/UX (Mock 데이터)

- **Task 001: 공통 레이아웃 및 라우트 구조 설정** ✅
  - ✅ protected 영역 하위 라우트 구조 생성 (/protected/events, /protected/events/new, /protected/events/[id], /protected/events/[id]/edit, /protected/notifications)
  - ✅ 공통 헤더 컴포넌트 확장 (서비스명 로고, 알림 아이콘 자리, 네비게이션 메뉴)
  - ✅ 모바일 반응형 네비게이션 (대시보드, 이벤트 생성, 알림 목록)
  - ✅ 빈 페이지 껍데기 파일 생성 (각 라우트별 최소 구조)

- **Task 002: 대시보드 페이지 UI (Mock)** ✅
  - ✅ Mock 이벤트 데이터로 대시보드 UI 구현 (내가 만든 이벤트 / 내가 참여하는 이벤트 탭)
  - ✅ 이벤트 카드 컴포넌트 (제목, 장소, 날짜, 상태 뱃지, 정원 표시)
  - ✅ 이벤트 상태별 뱃지 표시 (open/closed/cancelled, pending/approved/rejected)
  - ✅ "이벤트 만들기" 버튼 및 빈 상태(empty state) UI
  - ✅ Playwright MCP를 활용한 UI 스냅샷 검토

- **Task 003: 이벤트 생성/수정 페이지 UI (Mock)** ✅
  - ✅ 이벤트 생성 폼 UI (제목, 설명, 장소, 날짜/시간, 정원 입력)
  - ✅ 이벤트 수정 폼 UI (기존 값 프리필, 생성 폼 컴포넌트 재사용)
  - ✅ 이벤트 상태 변경 셀렉트 (open / closed / cancelled)
  - ✅ 이벤트 삭제 확인 다이얼로그
  - ✅ React Hook Form + Zod 스키마 기반 유효성 검사 (Mock 제출)
  - ✅ Playwright MCP를 활용한 폼 UI 검토

- **Task 004: 이벤트 상세 페이지 UI (Mock)** ✅
  - ✅ 이벤트 상세 공통 영역 UI (제목, 장소, 날짜, 정원, 상태, 링크 복사 버튼)
  - ✅ nuqs 기반 탭 상태 관리 (공지/참여자/카풀/정산 탭, URL 쿼리 파라미터)
  - ✅ 참여자 탭 UI (참여 신청자 목록, 상태별 표시, 승인 인원/정원 표시)
  - ✅ 참여 신청 버튼 (비참여자/미승인 참여자에게 노출)
  - ✅ 승인/거절 버튼 (주최자만 노출)
  - ✅ 역할별 UI 분기 (주최자 vs 참여자) — Mock 역할 토글로 검토
  - ✅ Playwright MCP를 활용한 상세 페이지 UI 검토

#### 1-B: DB 연동

- **Task 005: DB 마이그레이션 - events, event_members 테이블 + RLS** ✅
  - ✅ Supabase 마이그레이션으로 events 테이블 생성 (id, host_id, title, description, location, start_at, capacity, status, created_at)
  - ✅ event_members 테이블 생성 (id, event_id, user_id, status, joined_at)
  - ✅ events RLS 정책 설정: 모든 로그인 사용자 읽기, 주최자(host_id)만 쓰기
  - ✅ event_members RLS 정책 설정: 주최자/본인 레코드 읽기, 본인만 쓰기
  - ✅ status 필드 CHECK 제약조건 (events: open/closed/cancelled, event_members: pending/approved/rejected)
  - ✅ TypeScript 타입 생성 (Supabase generate-typescript-types 활용)

- **Task 006: 이벤트 CRUD API 연동** ✅
  - ✅ Mock 데이터를 TanStack Query + Server Action 기반 실제 데이터로 교체
  - ✅ 이벤트 생성/수정/삭제 Server Action 구현
  - ✅ 대시보드 이벤트 목록 실제 데이터 페칭
  - ✅ 참여 신청/승인/거절 Server Action 구현
  - ✅ Playwright MCP를 활용한 이벤트 생성/수정/삭제 E2E 테스트

- **Task 007: 링크 공유 및 자동 참여 신청 기능** ✅
  - ✅ 공유 링크 접근 시 비로그인 처리 (로그인 페이지 리디렉션 + redirect_to 파라미터)
  - ✅ 로그인/회원가입 완료 후 이벤트 상세 페이지 자동 리디렉션
  - ✅ 리디렉션 후 자동 참여 신청 처리 로직
  - ✅ Playwright MCP를 활용한 링크 공유 참여 플로우 E2E 테스트

- **Task 007-1: Phase 1 통합 테스트** ✅
  - ✅ 주최자 플로우 전체 테스트 (이벤트 생성 → 상세 확인 → 수정 → 삭제)
  - ✅ 참여자 플로우 전체 테스트 (링크 접근 → 로그인 → 참여 신청 → 승인 확인)
  - ✅ RLS 정책 검증 테스트 (권한 없는 접근 차단 확인)
  - ✅ 에러 핸들링 및 엣지 케이스 테스트 (정원 초과, 중복 신청, 취소된 이벤트 접근 등)

### Phase 2: 공지 + 카풀 ✅

#### 2-A: UI/UX (Mock 데이터)

- **Task 008: 공지 탭 및 작성 페이지 UI (Mock)** ✅
  - ✅ 이벤트 상세 공지 탭 UI (공지 목록, 제목, 작성일시 표시)
  - ✅ 공지 작성 버튼 (주최자만 노출)
  - ✅ 공지 작성 페이지 폼 UI (제목, 내용 입력)
  - ✅ 미승인 참여자 접근 시 안내 메시지
  - ✅ Playwright MCP를 활용한 공지 UI 검토

- **Task 009: 카풀 탭 및 등록 페이지 UI (Mock)** ✅
  - ✅ 이벤트 상세 카풀 탭 UI (카풀 목록: 드라이버명, 출발지, 잔여 좌석)
  - ✅ 카풀 등록 버튼 (승인된 참여자/주최자만 노출)
  - ✅ 카풀 등록 페이지 폼 UI (출발지, 좌석 수, 메모 입력)
  - ✅ 탑승 신청/취소 버튼 상태 표시
  - ✅ Playwright MCP를 활용한 카풀 UI 검토

#### 2-B: DB 연동

- **Task 010: DB 마이그레이션 - announcements, carpools, carpool_members 테이블 + RLS** ✅
  - ✅ announcements 테이블 생성 (id, event_id, author_id, title, content, created_at)
  - ✅ carpools 테이블 생성 (id, event_id, driver_id, seats, departure_location, note, created_at)
  - ✅ carpool_members 테이블 생성 (id, carpool_id, user_id, created_at)
  - ✅ announcements RLS: 주최자/승인된 참여자만 읽기, 주최자만 쓰기
  - ✅ carpools RLS: 주최자/승인된 참여자만 읽기/쓰기
  - ✅ carpool_members RLS: 주최자/승인된 참여자만 읽기, 본인만 쓰기
  - ✅ TypeScript 타입 업데이트

- **Task 011: 공지 + 카풀 API 연동** ✅
  - ✅ Mock 데이터를 TanStack Query + Server Action 기반 실제 데이터로 교체
  - ✅ 공지 작성 Server Action 구현
  - ✅ 카풀 등록/탑승 신청/취소 Server Action 구현 (잔여 좌석 검증 포함)
  - ✅ Playwright MCP를 활용한 공지 작성/카풀 등록 E2E 테스트

- **Task 011-1: Phase 2 통합 테스트** ✅
  - ✅ 공지 전체 플로우 테스트 (공지 작성 → 승인된 참여자 열람 → 미승인 참여자 차단)
  - ✅ 카풀 전체 플로우 테스트 (카풀 등록 → 탑승 신청 → 잔여 좌석 업데이트)
  - ✅ 역할별 접근 제어 테스트 (주최자/승인된 참여자/미승인 참여자 권한 분기)
  - ✅ 에러 핸들링 테스트 (좌석 초과 신청, 중복 탑승 등)

### Phase 3: 정산 + 웹 알림

#### 3-A: UI/UX (Mock 데이터)

- **Task 012: 정산 탭 및 생성 페이지 UI (Mock)**
  - 이벤트 상세 정산 탭 UI (총액, 1인 금액, 참여자별 납부 여부 목록)
  - 정산 생성 버튼 (주최자만, 정산 미생성 시 노출)
  - 정산 생성 페이지 폼 UI (총액, 설명 입력, 1인 금액 자동 계산 미리보기)
  - 납부 체크/해제 버튼 상태 표시 (주최자만 조작 가능)
  - Playwright MCP를 활용한 정산 UI 검토

- **Task 013: 알림 목록 페이지 및 헤더 알림 벨 UI (Mock)**
  - 헤더 알림 벨 아이콘 + 안읽은 알림 수 뱃지 (Mock 카운트)
  - 알림 목록 페이지 UI (알림 타입별 아이콘/메시지, 읽음/안읽음 상태 표시)
  - "전체 읽음 처리" 버튼
  - Playwright MCP를 활용한 알림 UI 검토

#### 3-B: DB 연동

- **Task 014: DB 마이그레이션 - settlements, settlement_members, notifications 테이블 + RLS**
  - settlements 테이블 생성 (id, event_id, total_amount, description, created_at)
  - settlement_members 테이블 생성 (id, settlement_id, user_id, paid, paid_at)
  - notifications 테이블 생성 (id, user_id, event_id, type, message, is_read, created_at)
  - settlements RLS: 주최자/승인된 참여자만 읽기, 주최자만 쓰기
  - settlement_members RLS: 주최자/본인 레코드 읽기, 주최자만 쓰기
  - notifications RLS: 본인 레코드만 읽기, 시스템(트리거)만 쓰기
  - 알림 생성 트리거 함수 작성 (새 공지, 참여 신청, 정산 생성 시 자동 알림)
  - TypeScript 타입 업데이트

- **Task 015: 정산 + 알림 API 연동**
  - Mock 데이터를 TanStack Query + Server Action 기반 실제 데이터로 교체
  - 정산 생성 Server Action 구현 (settlement + settlement_members 동시 생성)
  - 납부 체크/해제 Server Action 구현
  - 알림 읽음 처리 Server Action 구현
  - Supabase Realtime 구독으로 notifications 테이블 실시간 감지 (뱃지 카운트 업데이트)
  - Playwright MCP를 활용한 정산/알림 E2E 테스트

- **Task 015-1: Phase 3 통합 테스트 및 전체 최종 검증**
  - 정산 전체 플로우 테스트 (정산 생성 → 1/N 계산 → 납부 체크)
  - 알림 전체 플로우 테스트 (공지 작성 시 알림 → 참여 신청 시 알림 → 정산 생성 시 알림)
  - Supabase Realtime 알림 뱃지 실시간 업데이트 테스트
  - 전체 사용자 플로우 E2E 테스트 (주최자: 이벤트 생성 → 참여자 승인 → 공지 → 카풀 → 정산)
  - 전체 사용자 플로우 E2E 테스트 (참여자: 링크 접근 → 가입 → 참여 → 공지 확인 → 카풀 탑승 → 정산 확인)
  - 모바일 반응형 레이아웃 테스트
  - 에러 핸들링 및 엣지 케이스 최종 점검
