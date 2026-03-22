"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

// 허용 파일 형식
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// 최대 파일 크기: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AvatarUploadProps = {
  // 현재 아바타 URL
  value?: string | null;
  // 업로드 완료 후 URL 전달 콜백
  onChange: (url: string) => void;
  // 사용자 ID (스토리지 경로 생성에 사용)
  userId: string;
  // 표시용 이름 (Fallback 텍스트)
  displayName?: string | null;
};

export function AvatarUpload({
  value,
  onChange,
  userId,
  displayName,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "jpg, png, webp 형식만 업로드 가능합니다.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "파일 크기는 5MB 이하여야 합니다.";
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 같은 파일 재선택 허용
    e.target.value = "";

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${userId}/${Date.now()}_avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setError("아바타 업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 이름 이니셜 (Fallback 텍스트)
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "ME";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 아바타 + 카메라 버튼 */}
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={value ?? undefined} alt="프로필 아바타" />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        {/* 업로드 버튼 오버레이 */}
        <button
          type="button"
          onClick={() => !isUploading && inputRef.current?.click()}
          disabled={isUploading}
          aria-label="아바타 변경"
          className="bg-background border-border absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 shadow-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-destructive text-xs">{error}</p>}

      <p className="text-muted-foreground text-xs">
        클릭하여 아바타 변경 (JPG, PNG, WEBP · 최대 5MB)
      </p>
    </div>
  );
}
