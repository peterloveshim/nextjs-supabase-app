"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { CarpoolFormValues } from "@/lib/validations/carpool";

// 공통 응답 타입
type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

// 카풀 뷰 타입 (목록 표시용)
export type CarpoolView = {
  id: string;
  driverId: string;
  driverName: string;
  departureLocation: string;
  seats: number;
  takenSeats: number;
  note: string | null;
  isJoined: boolean;
};

/**
 * 이벤트 카풀 목록 조회
 * - driver profiles JOIN + carpool_members JOIN
 * - isJoined: 현재 사용자 탑승 여부
 */
export async function fetchCarpools(eventId: string): Promise<CarpoolView[]> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const { data, error } = await supabase
    .from("carpools")
    .select(
      "id, driver_id, departure_location, seats, note, profiles(full_name), carpool_members(user_id)"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  type ProfileRow = { full_name: string | null };
  type MemberRow = { user_id: string };

  return data.map((item) => {
    const profile = item.profiles as ProfileRow | ProfileRow[] | null;
    const profileData = Array.isArray(profile) ? profile[0] : profile;

    const members = (item.carpool_members ?? []) as MemberRow[];
    const takenSeats = members.length;
    const isJoined = !!userId && members.some((m) => m.user_id === userId);

    return {
      id: item.id,
      driverId: item.driver_id,
      driverName: profileData?.full_name ?? "알 수 없음",
      departureLocation: item.departure_location,
      seats: item.seats,
      takenSeats,
      note: item.note,
      isJoined,
    };
  });
}

/**
 * 카풀 등록
 * - 승인된 참여자 또는 주최자만 등록 가능 (RLS로 제어)
 * - driver_id = 현재 사용자 ID
 */
export async function createCarpool(
  eventId: string,
  values: CarpoolFormValues
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("carpools").insert({
    event_id: eventId,
    driver_id: userId,
    departure_location: values.departureLocation,
    seats: values.seats,
    note: values.note ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${eventId}`);
  return { success: true };
}

/**
 * 카풀 탑승 신청
 * - 잔여 좌석 확인 후 carpool_members INSERT
 * - UNIQUE 제약 위반(23505) 처리
 */
export async function joinCarpool(carpoolId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 카풀 정보 및 이벤트 ID 조회
  const { data: carpool, error: carpoolError } = await supabase
    .from("carpools")
    .select("id, seats, event_id")
    .eq("id", carpoolId)
    .single();

  if (carpoolError || !carpool) {
    return { success: false, error: "카풀을 찾을 수 없습니다." };
  }

  // 현재 탑승자 수 확인
  const { count: takenSeats } = await supabase
    .from("carpool_members")
    .select("id", { count: "exact", head: true })
    .eq("carpool_id", carpoolId);

  if (takenSeats !== null && takenSeats >= carpool.seats) {
    return { success: false, error: "정원이 가득 찼습니다." };
  }

  const { error } = await supabase.from("carpool_members").insert({
    carpool_id: carpoolId,
    user_id: userId,
  });

  if (error) {
    // UNIQUE 제약 위반 (이미 탑승 신청된 경우)
    if (error.code === "23505") {
      return { success: false, error: "이미 탑승 신청한 카풀입니다." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath(`/protected/events/${carpool.event_id}`);
  return { success: true };
}

/**
 * 카풀 탑승 취소
 * - carpool_members에서 현재 사용자 레코드 삭제
 */
export async function leaveCarpool(carpoolId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 이벤트 ID 조회 (revalidatePath용)
  const { data: carpool } = await supabase
    .from("carpools")
    .select("event_id")
    .eq("id", carpoolId)
    .single();

  const { error } = await supabase
    .from("carpool_members")
    .delete()
    .eq("carpool_id", carpoolId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  if (carpool?.event_id) {
    revalidatePath(`/protected/events/${carpool.event_id}`);
  }
  return { success: true };
}
