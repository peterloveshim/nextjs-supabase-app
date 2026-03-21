"use client";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// 허용 파일 형식
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
// 최대 파일 크기: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ImageUploadProps = {
  // 현재 이미지 URL (수정 시 기존 이미지 표시용)
  value?: string | null;
  // 업로드 완료 후 URL 전달 콜백
  onChange: (url: string | null) => void;
  // 업로드 경로 접두사 (예: 사용자 ID)
  userId: string;
};

export function ImageUpload({ value, onChange, userId }: ImageUploadProps) {
  // 업로드 중 로딩 상태
  const [isUploading, setIsUploading] = useState(false);
  // 드래그 오버 상태 (시각적 피드백용)
  const [isDragOver, setIsDragOver] = useState(false);
  // 에러 메시지
  const [error, setError] = useState<string | null>(null);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "jpg, jpeg, png, webp, gif 형식만 업로드 가능합니다.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "파일 크기는 5MB 이하여야 합니다.";
    }
    return null;
  };

  // Supabase Storage에 파일 업로드
  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const supabase = createClient();

        // 파일 경로: {userId}/{timestamp}_{원본파일명}
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${userId}/${timestamp}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          return;
        }

        // public URL 획득
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);

        onChange(urlData.publicUrl);
      } catch {
        setError("이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [userId, onChange]
  );

  // 파일 input change 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // 같은 파일 재선택 허용을 위해 value 초기화
    e.target.value = "";
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // 이미지 제거 핸들러 (Storage에서 삭제하지 않고 폼 값만 초기화)
  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  // 이미지가 있는 경우: 미리보기 + 삭제 버튼
  if (value) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border">
        {/* 이미지 미리보기 */}
        <div className="bg-muted relative aspect-video w-full">
          <Image
            src={value}
            alt="이벤트 이미지 미리보기"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
        {/* 이미지 제거 버튼 */}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={handleRemove}
          aria-label="이미지 제거"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // 이미지가 없는 경우: 업로드 영역
  return (
    <div className="space-y-2">
      {/*
       * label이 input을 직접 감싸는 암묵적 연결(implicit association) 방식
       * → htmlFor + id 매칭 방식보다 모든 브라우저에서 100% 안정적
       * → label 클릭 시 브라우저가 내부 input을 네이티브로 활성화
       * → input이 display:none이어도 label 클릭으로 파일 선택창이 열림
       */}
      <label
        aria-label="이미지 업로드 영역. 클릭하거나 파일을 드래그하세요."
        className={[
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2",
          "rounded-lg border-2 border-dashed px-4 py-10 transition-colors",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          isUploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // 업로드 중에는 파일 선택창 열리지 않도록 차단
          if (isUploading) e.preventDefault();
        }}
      >
        {isUploading ? (
          <>
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">업로드 중...</p>
          </>
        ) : (
          <>
            {isDragOver ? (
              <Upload className="text-primary h-8 w-8" />
            ) : (
              <ImageIcon className="text-muted-foreground h-8 w-8" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragOver
                  ? "파일을 놓으세요"
                  : "클릭 또는 드래그하여 이미지 업로드"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                JPG, PNG, WEBP, GIF (최대 5MB)
              </p>
            </div>
          </>
        )}

        {/* input을 label 안에 직접 배치 — 암묵적 연결로 클릭 시 파일 선택창 열림 */}
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {/* 에러 메시지 */}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
