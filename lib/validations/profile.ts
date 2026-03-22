import { z } from "zod";

export const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이하여야 합니다"),
  bio: z.string().max(200, "소개는 200자 이하여야 합니다").optional(),
  avatar_url: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
