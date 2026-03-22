-- ============================================================
-- profiles 테이블 RLS 정책 정리 및 GRANT 수정
-- 문제 1: authenticated 역할에 UPDATE/INSERT/DELETE GRANT 누락
-- 문제 2: 중복·불일치 RLS 정책 혼재 (7개 → 4개로 정리)
-- ============================================================

-- 1. 기존 중복 정책 전부 제거
DROP POLICY IF EXISTS "본인 프로필 생성" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 삽입 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필 조회" ON public.profiles;
DROP POLICY IF EXISTS "인증된 사용자 프로필 조회" ON public.profiles;
DROP POLICY IF EXISTS "프로필은 모든 로그인 사용자가 조회 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필 수정" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 수정 가능" ON public.profiles;

-- 2. 누락된 GRANT 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 3. RLS 정책 단일화 (명확한 역할 지정)

-- SELECT: 로그인한 사용자는 모든 프로필 조회 가능
CREATE POLICY "authenticated_select_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: 본인 ID로만 생성 가능
CREATE POLICY "authenticated_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- UPDATE: 본인 프로필만 수정 가능 (USING + WITH CHECK 모두 명시)
CREATE POLICY "authenticated_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- DELETE: 본인 프로필만 삭제 가능
CREATE POLICY "authenticated_delete_own_profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id);
