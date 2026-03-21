import { z } from "zod";

// 카풀 등록 폼 유효성 검사 스키마
export const carpoolFormSchema = z.object({
  departureLocation: z.string().min(1, "출발지를 입력해주세요."),
  seats: z
    .number({ error: "좌석 수를 숫자로 입력해주세요." })
    .min(1, "1~10명 사이로 입력해주세요.")
    .max(10, "1~10명 사이로 입력해주세요."),
  note: z.string().optional(),
});

// 폼 필드 타입 (useForm에서 사용)
export type CarpoolFormValues = z.infer<typeof carpoolFormSchema>;
