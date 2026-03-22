"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  EventListItem,
  EventStatus,
  MemberStatus,
} from "@/lib/types/event";
import type { PaginatedEvents, ProfileData } from "@/lib/types/profile";
import type { ProfileFormValues } from "@/lib/validations/profile";

// 공통 응답 타입
type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

const PAGE_SIZE = 5;

/**
 * 현재 사용자 프로필 조회
 */
export async function fetchProfile(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email ?? "",
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    bio: data.bio,
  };
}

/**
 * 프로필 수정 (이름, 소개, 아바타 URL)
 */
export async function updateProfile(
  values: ProfileFormValues
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.full_name,
      bio: values.bio ?? null,
      avatar_url: values.avatar_url ?? null,
    })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/protected/profile");
  return { success: true };
}

/**
 * 내가 주최한 이벤트 목록 (페이지네이션 + 검색)
 */
export async function fetchHostedEvents({
  page = 1,
  search = "",
  pageSize = PAGE_SIZE,
}: {
  page?: number;
  search?: string;
  pageSize?: number;
}): Promise<PaginatedEvents> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { data: [], total: 0, page, pageSize };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("events")
    .select("id, title, location, start_at, capacity, status, image_url", {
      count: "exact",
    })
    .eq("host_id", userId)
    .order("start_at", { ascending: false })
    .range(from, to);

  if (search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  const { data: events, error, count } = await query;

  if (error || !events) return { data: [], total: 0, page, pageSize };

  const eventIds = events.map((e) => e.id);
  const { data: memberCounts } =
    eventIds.length > 0
      ? await supabase
          .from("event_members")
          .select("event_id, status")
          .in("event_id", eventIds)
          .eq("status", "approved")
      : { data: [] };

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => {
    countMap[m.event_id] = (countMap[m.event_id] ?? 0) + 1;
  });

  const data: EventListItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    startAt: e.start_at,
    capacity: e.capacity,
    status: e.status as EventStatus,
    approvedCount: countMap[e.id] ?? 0,
    imageUrl: e.image_url,
  }));

  return { data, total: count ?? 0, page, pageSize };
}

/**
 * 내가 참여 중인 이벤트 목록 (status='approved', 페이지네이션 + 검색)
 */
export async function fetchJoinedEventsPaginated({
  page = 1,
  search = "",
  pageSize = PAGE_SIZE,
}: {
  page?: number;
  search?: string;
  pageSize?: number;
}): Promise<PaginatedEvents> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { data: [], total: 0, page, pageSize };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 검색어가 있을 때: events 테이블을 먼저 필터링 후 JOIN
  // 검색어가 없을 때: event_members 기준으로 페이지네이션
  if (search.trim()) {
    // 검색어로 이벤트 필터링 후, 내가 승인된 이벤트만 추출
    const { data: matchedEvents, count } = await supabase
      .from("events")
      .select("id, title, location, start_at, capacity, status, image_url", {
        count: "exact",
      })
      .ilike("title", `%${search.trim()}%`)
      .in(
        "id",
        (
          await supabase
            .from("event_members")
            .select("event_id")
            .eq("user_id", userId)
            .eq("status", "approved")
        ).data?.map((m) => m.event_id) ?? []
      )
      .order("start_at", { ascending: false })
      .range(from, to);

    if (!matchedEvents) return { data: [], total: 0, page, pageSize };

    const eventIds = matchedEvents.map((e) => e.id);
    const { data: memberCounts } =
      eventIds.length > 0
        ? await supabase
            .from("event_members")
            .select("event_id, status")
            .in("event_id", eventIds)
            .eq("status", "approved")
        : { data: [] };

    const countMap: Record<string, number> = {};
    (memberCounts ?? []).forEach((m) => {
      countMap[m.event_id] = (countMap[m.event_id] ?? 0) + 1;
    });

    const data: EventListItem[] = matchedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      startAt: e.start_at,
      capacity: e.capacity,
      status: e.status as EventStatus,
      approvedCount: countMap[e.id] ?? 0,
      myStatus: "approved" as MemberStatus,
      imageUrl: e.image_url,
    }));

    return { data, total: count ?? 0, page, pageSize };
  }

  // 검색 없이 event_members 기준 페이지네이션
  const {
    data: members,
    error,
    count,
  } = await supabase
    .from("event_members")
    .select(
      "status, events(id, title, location, start_at, capacity, status, image_url)",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("joined_at", { ascending: false })
    .range(from, to);

  if (error || !members) return { data: [], total: 0, page, pageSize };

  type JoinedEventRow = {
    id: string;
    title: string;
    location: string;
    start_at: string;
    capacity: number;
    status: string;
    image_url: string | null;
  };

  const validMembers = members.filter((m) => m.events !== null);
  const eventIds = validMembers.map(
    (m) => (m.events as unknown as JoinedEventRow).id
  );

  const { data: memberCounts } =
    eventIds.length > 0
      ? await supabase
          .from("event_members")
          .select("event_id, status")
          .in("event_id", eventIds)
          .eq("status", "approved")
      : { data: [] };

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => {
    countMap[m.event_id] = (countMap[m.event_id] ?? 0) + 1;
  });

  const data: EventListItem[] = validMembers.map((m) => {
    const event = m.events as unknown as JoinedEventRow;
    return {
      id: event.id,
      title: event.title,
      location: event.location,
      startAt: event.start_at,
      capacity: event.capacity,
      status: event.status as EventStatus,
      approvedCount: countMap[event.id] ?? 0,
      myStatus: m.status as MemberStatus,
      imageUrl: event.image_url,
    };
  });

  return { data, total: count ?? 0, page, pageSize };
}
