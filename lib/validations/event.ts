import { z } from "zod";

// React Hook Form 내부에서 관리하는 폼 필드 타입
// - startAt: datetime-local input 값 (string)
// - capacity: number input 값 (number)
export const eventFormSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상 입력해주세요."),
  description: z.string().optional(),
  location: z.string().min(2, "장소는 2자 이상 입력해주세요."),
  // datetime-local input에서 받은 문자열 그대로 유지
  startAt: z.string().min(1, "날짜/시간을 입력해주세요."),
  // number input에서 숫자로 받음
  capacity: z
    .number({ error: "정원을 숫자로 입력해주세요." })
    .min(1, "정원은 최소 1명 이상이어야 합니다.")
    .max(100, "정원은 최대 100명까지 입력 가능합니다."),
  status: z.enum(["open", "closed", "cancelled"]).optional(),
  // 이미지 URL (선택): 빈 문자열이거나 http(s)://로 시작하는 URL
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      "http:// 또는 https://로 시작하는 URL을 입력해주세요."
    )
    .optional(),
});

// 폼 필드 타입 (useForm에서 사용)
export type EventFormValues = z.infer<typeof eventFormSchema>;

// 제출 시 startAt을 Date로 변환한 최종 타입
export type EventSubmitValues = Omit<EventFormValues, "startAt"> & {
  startAt: Date;
};

// 폼 값을 제출 값으로 변환
export function toEventSubmitValues(
  values: EventFormValues
): EventSubmitValues {
  return {
    ...values,
    startAt: new Date(values.startAt),
  };
}
