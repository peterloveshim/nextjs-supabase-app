-- profiles 테이블 강화 마이그레이션
-- 1. 신규 유저 자동 프로필 생성 트리거
-- 2. updated_at 자동 갱신 트리거
-- 3. RLS 정책 설정
-- 4. 기존 유저 백필

-- 1. handle_new_user: auth.users INSERT 시 profiles 레코드 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = ''
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. handle_updated_at: profiles UPDATE 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. RLS 활성화 및 정책 설정 (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "프로필은 모든 로그인 사용자가 조회 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 수정 가능" ON public.profiles;
DROP POLICY IF EXISTS "본인 프로필만 삽입 가능" ON public.profiles;

CREATE POLICY "프로필은 모든 로그인 사용자가 조회 가능" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "본인 프로필만 삽입 가능" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "본인 프로필만 수정 가능" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 4. 기존 auth.users 백필 (이미 가입된 유저 대응)
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'avatar_url',
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
