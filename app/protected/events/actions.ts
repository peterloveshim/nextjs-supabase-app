"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  EventDetailView,
  EventListItem,
  EventMemberWithProfile,
  EventStatus,
  MemberStatus,
} from "@/lib/types/event";
import type { EventFormValues } from "@/lib/validations/event";

// ─── 조회 Server Actions ────────────────────────────────────────────────────

/**
 * 내가 만든 이벤트 목록 조회
 */
export async function fetchMyEvents(): Promise<EventListItem[]> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return [];

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, location, start_at, capacity, status, image_url")
    .eq("host_id", userId)
    .order("start_at", { ascending: false });

  if (error || !events) return [];

  const eventIds = events.map((e) => e.id);
  const { data: memberCounts } = await supabase
    .from("event_members")
    .select("event_id, status")
    .in("event_id", eventIds)
    .eq("status", "approved");

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => {
    countMap[m.event_id] = (countMap[m.event_id] ?? 0) + 1;
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    startAt: e.start_at,
    capacity: e.capacity,
    status: e.status as EventStatus,
    approvedCount: countMap[e.id] ?? 0,
    imageUrl: e.image_url,
  }));
}

/**
 * 내가 참여 신청한 이벤트 목록 조회
 */
export async function fetchJoinedEvents(): Promise<EventListItem[]> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return [];

  const { data: members, error } = await supabase
    .from("event_members")
    .select(
      "id, status, events(id, title, location, start_at, capacity, status, image_url)"
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error || !members) return [];

  type JoinedEventRow = {
    id: string;
    title: string;
    location: string;
    start_at: string;
    capacity: number;
    status: string;
    image_url: string | null;
  };

  const eventIds = members
    .map((m) => (m.events as unknown as JoinedEventRow | null)?.id)
    .filter((id): id is string => !!id);

  const { data: memberCounts } = await supabase
    .from("event_members")
    .select("event_id, status")
    .in("event_id", eventIds)
    .eq("status", "approved");

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m) => {
    countMap[m.event_id] = (countMap[m.event_id] ?? 0) + 1;
  });

  return members
    .filter((m) => m.events !== null)
    .map((m) => {
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
}

/**
 * 이벤트 상세 조회 (이벤트 + 참여자 목록)
 */
export async function fetchEventDetail(
  id: string
): Promise<EventDetailView | null> {
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, host_id, title, description, location, start_at, capacity, status, image_url"
    )
    .eq("id", id)
    .single();

  if (eventError || !event) return null;

  const { data: hostProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", event.host_id)
    .single();

  const { data: members } = await supabase
    .from("event_members")
    .select("id, user_id, status, joined_at, profiles(full_name, email)")
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  type ProfileRow = { full_name: string | null; email: string };

  const memberList: EventMemberWithProfile[] = (members ?? []).map((m) => {
    const profile = m.profiles as ProfileRow | ProfileRow[] | null;
    const profileData = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: m.id,
      userId: m.user_id,
      name: profileData?.full_name ?? "알 수 없음",
      email: profileData?.email ?? "",
      status: m.status as MemberStatus,
      joinedAt: m.joined_at,
    };
  });

  return {
    id: event.id,
    hostId: event.host_id,
    hostName: hostProfile?.full_name ?? null,
    title: event.title,
    description: event.description,
    location: event.location,
    startAt: event.start_at,
    capacity: event.capacity,
    status: event.status as EventStatus,
    members: memberList,
    imageUrl: event.image_url,
  };
}

/**
 * 현재 로그인한 사용자 ID 조회
 */
export async function fetchCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  return claimsData?.claims?.sub ?? null;
}

// 공통 응답 타입
type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

/**
 * 이벤트 생성
 * host_id는 현재 로그인한 사용자 ID로 설정
 */
export async function createEvent(
  values: EventFormValues
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      host_id: userId,
      title: values.title,
      description: values.description ?? null,
      location: values.location,
      start_at: new Date(values.startAt).toISOString(),
      capacity: values.capacity,
      status: values.status ?? "open",
      image_url: values.imageUrl || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // 이벤트 생성자를 자동으로 승인된 참여자로 추가
  await supabase.from("event_members").insert({
    event_id: data.id,
    user_id: userId,
    status: "approved",
  });

  revalidatePath("/protected/events");
  return { success: true, data: { id: data.id } };
}

/**
 * 이벤트 수정
 * host_id = auth.uid() 조건으로 권한 확인
 */
export async function updateEvent(
  id: string,
  values: EventFormValues
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: values.title,
      description: values.description ?? null,
      location: values.location,
      start_at: new Date(values.startAt).toISOString(),
      capacity: values.capacity,
      status: values.status ?? "open",
      image_url: values.imageUrl || null,
    })
    .eq("id", id)
    .eq("host_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/protected/events");
  revalidatePath(`/protected/events/${id}`);
  return { success: true };
}

/**
 * 이벤트 삭제
 * host_id = auth.uid() 조건으로 권한 확인
 * 이벤트 삭제 시 연결된 Storage 이미지도 함께 삭제
 */
export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 삭제 전 이미지 URL 조회 (Storage 정리용)
  const { data: event } = await supabase
    .from("events")
    .select("image_url")
    .eq("id", id)
    .eq("host_id", userId)
    .single();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("host_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // event-images 버킷 내 이미지 삭제 (실패해도 이벤트 삭제는 성공으로 처리)
  if (event?.image_url) {
    const imageUrl = event.image_url;
    const bucketMarker = "/event-images/";
    const markerIndex = imageUrl.indexOf(bucketMarker);
    if (markerIndex !== -1) {
      // URL 인코딩된 문자(한글, 공백 등)를 디코딩하여 실제 스토리지 경로로 변환
      const rawPath = imageUrl.slice(markerIndex + bucketMarker.length);
      // 쿼리스트링 제거 후 디코딩
      const storagePath = decodeURIComponent(rawPath.split("?")[0]);
      await supabase.storage.from("event-images").remove([storagePath]);
    }
  }

  revalidatePath("/protected/events");
  return { success: true };
}

/**
 * 이벤트 참여 신청
 * - 정원 초과 / closed / cancelled 이벤트 체크
 * - UNIQUE 제약 중복 신청 처리
 */
export async function applyEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 이벤트 상태 및 정원 확인
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, host_id, status, capacity")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "이벤트를 찾을 수 없습니다." };
  }

  if (event.status === "closed") {
    return { success: false, error: "마감된 이벤트입니다." };
  }

  if (event.status === "cancelled") {
    return { success: false, error: "취소된 이벤트입니다." };
  }

  // 승인된 참여자 수 확인 (정원 초과 체크)
  const { count: approvedCount } = await supabase
    .from("event_members")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved");

  if (approvedCount !== null && approvedCount >= event.capacity) {
    return { success: false, error: "정원이 가득 찼습니다." };
  }

  // 기존 신청 여부 확인 (중복 체크)
  const { data: existingMember } = await supabase
    .from("event_members")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  // 주최자 여부 확인 (주최자는 자동 승인)
  const isHost = event.host_id === userId;
  const applyStatus = isHost ? "approved" : "pending";

  if (existingMember) {
    if (existingMember.status === "pending") {
      return { success: false, error: "이미 참여 신청 중입니다." };
    }
    if (existingMember.status === "approved") {
      return { success: false, error: "이미 참여 승인된 이벤트입니다." };
    }
    // rejected 상태면 재신청 허용 (기존 레코드 업데이트)
    const { error: updateError } = await supabase
      .from("event_members")
      .update({ status: applyStatus })
      .eq("id", existingMember.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath(`/protected/events/${eventId}`);
    return { success: true };
  }

  // 신규 신청 INSERT
  const { error } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: userId,
    status: applyStatus,
  });

  if (error) {
    // UNIQUE 제약 위반 (동시 신청 경합)
    if (error.code === "23505") {
      return { success: false, error: "이미 참여 신청한 이벤트입니다." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${eventId}`);
  return { success: true };
}

/**
 * 참여 취소 (approved 상태인 멤버 삭제)
 * - 본인: 자신의 참여를 취소 가능
 * - 주최자: 모든 approved 멤버의 참여 취소 가능
 */
export async function cancelMembership(
  memberId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 멤버 조회
  const { data: member, error: memberError } = await supabase
    .from("event_members")
    .select("id, user_id, event_id, status")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return { success: false, error: "참여자를 찾을 수 없습니다." };
  }

  if (member.status !== "approved") {
    return { success: false, error: "승인된 참여자만 취소할 수 있습니다." };
  }

  // 본인이 아닌 경우 주최자 여부 확인
  if (member.user_id !== userId) {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", member.event_id)
      .eq("host_id", userId)
      .single();

    if (eventError || !event) {
      return { success: false, error: "권한이 없습니다." };
    }
  }

  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${member.event_id}`);
  return { success: true };
}

/**
 * 참여자 상태 변경 (승인/거절)
 * 주최자만 가능: event_members.event_id → events.host_id = auth.uid()
 */
export async function updateMemberStatus(
  memberId: string,
  status: "approved" | "rejected"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 멤버 조회 후 주최자 권한 확인
  const { data: member, error: memberError } = await supabase
    .from("event_members")
    .select("id, event_id")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return { success: false, error: "참여자를 찾을 수 없습니다." };
  }

  // 해당 이벤트의 주최자인지 확인
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", member.event_id)
    .eq("host_id", userId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "권한이 없습니다." };
  }

  const { error } = await supabase
    .from("event_members")
    .update({ status })
    .eq("id", memberId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${member.event_id}`);
  return { success: true };
}
