import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 회원가입 시 초기 닉네임 자동 생성: 한글 형용사(3글자) + 명사(2~3글자) + 랜덤 숫자 4자리
// → 결과 예시: 귀여운고양이1234, 행복한여우5678
const KR_ADJECTIVES = [
  "귀여운",
  "용감한",
  "행복한",
  "신나는",
  "즐거운",
  "영리한",
  "용맹한",
  "따뜻한",
  "씩씩한",
  "총명한",
];
const KR_NOUNS = [
  "고양이",
  "강아지",
  "호랑이",
  "독수리",
  "물고기",
  "코끼리",
  "원숭이",
  "토끼",
  "여우",
  "늑대",
  "사자",
  "참새",
  "나비",
  "오리",
  "펭귄",
];

export function generateKoreanUsername(): string {
  const adj = KR_ADJECTIVES[Math.floor(Math.random() * KR_ADJECTIVES.length)];
  const noun = KR_NOUNS[Math.floor(Math.random() * KR_NOUNS.length)];
  const digits = String(Math.floor(Math.random() * 9000) + 1000);
  return adj + noun + digits;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
