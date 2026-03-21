import { z } from "zod";

// 공지 작성 폼 유효성 검사 스키마
export const announcementFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(100, "제목은 100자 이내로 입력해주세요."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(2000, "내용은 2000자 이내로 입력해주세요."),
});

// 폼 필드 타입 (useForm에서 사용)
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
