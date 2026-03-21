"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { AnnouncementFormValues } from "@/lib/validations/announcement";

// 공통 응답 타입
type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

// 공지 뷰 타입 (목록 표시용)
export type AnnouncementView = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
};

/**
 * 이벤트 공지 목록 조회
 * - profiles 테이블 JOIN으로 작성자 이름 가져오기
 * - 최신순 정렬
 */
export async function fetchAnnouncements(
  eventId: string
): Promise<AnnouncementView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, profiles(full_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  type ProfileRow = { full_name: string | null };

  return data.map((item) => {
    const profile = item.profiles as ProfileRow | ProfileRow[] | null;
    const profileData = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      authorName: profileData?.full_name ?? "알 수 없음",
      createdAt: item.created_at,
    };
  });
}

/**
 * 공지 작성
 * - 주최자만 작성 가능 (events.host_id = userId 확인)
 */
export async function createAnnouncement(
  eventId: string,
  values: AnnouncementFormValues
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 주최자 권한 확인
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", userId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "공지 작성 권한이 없습니다." };
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      author_id: userId,
      title: values.title,
      content: values.content,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${eventId}`);
  return { success: true, data: { id: data.id } };
}
