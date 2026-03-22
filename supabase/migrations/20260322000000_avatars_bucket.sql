-- avatars 스토리지 버킷 생성 및 RLS 정책 설정

-- 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 인증 사용자 업로드 허용
DROP POLICY IF EXISTS "인증 사용자 아바타 업로드 가능" ON storage.objects;
CREATE POLICY "인증 사용자 아바타 업로드 가능"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- 공개 조회 허용
DROP POLICY IF EXISTS "아바타 공개 조회 가능" ON storage.objects;
CREATE POLICY "아바타 공개 조회 가능"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- 본인 파일만 삭제 가능
DROP POLICY IF EXISTS "본인 아바타만 삭제 가능" ON storage.objects;
CREATE POLICY "본인 아바타만 삭제 가능"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);

-- 본인 파일만 수정 가능
DROP POLICY IF EXISTS "본인 아바타만 수정 가능" ON storage.objects;
CREATE POLICY "본인 아바타만 수정 가능"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);
