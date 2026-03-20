"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  applyEvent,
  createEvent,
  deleteEvent,
  fetchCurrentUserId,
  fetchEventDetail,
  fetchJoinedEvents,
  fetchMyEvents,
  updateEvent,
  updateMemberStatus,
} from "@/app/protected/events/actions";
import type { EventDetailView, EventListItem } from "@/lib/types/event";
import type { EventFormValues } from "@/lib/validations/event";

// 쿼리 키 상수
export const eventQueryKeys = {
  all: ["events"] as const,
  myEvents: () => [...eventQueryKeys.all, "my"] as const,
  joinedEvents: () => [...eventQueryKeys.all, "joined"] as const,
  detail: (id: string) => [...eventQueryKeys.all, "detail", id] as const,
};

/**
 * 내가 만든 이벤트 목록 조회
 * Server Action으로 서버 측 Supabase 클라이언트 사용 (RLS 인증 안정성)
 */
export function useMyEvents() {
  return useQuery<EventListItem[]>({
    queryKey: eventQueryKeys.myEvents(),
    queryFn: () => fetchMyEvents(),
  });
}

/**
 * 내가 참여 신청한 이벤트 목록 조회
 */
export function useJoinedEvents() {
  return useQuery<EventListItem[]>({
    queryKey: eventQueryKeys.joinedEvents(),
    queryFn: () => fetchJoinedEvents(),
  });
}

/**
 * 이벤트 상세 정보 조회 (이벤트 + 참여자 목록)
 */
export function useEventDetail(id: string) {
  return useQuery<EventDetailView | null>({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => fetchEventDetail(id),
    enabled: !!id,
  });
}

/**
 * 현재 로그인한 사용자 ID 조회
 */
export function useCurrentUserId() {
  return useQuery<string | null>({
    queryKey: ["currentUserId"],
    queryFn: () => fetchCurrentUserId(),
  });
}

/**
 * 이벤트 생성 mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: EventFormValues) => createEvent(values),
    onSuccess: (result) => {
      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.myEvents() });
        router.push("/protected/events");
      }
    },
  });
}

/**
 * 이벤트 수정 mutation
 */
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: EventFormValues) => updateEvent(id, values),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.myEvents() });
        queryClient.invalidateQueries({
          queryKey: eventQueryKeys.detail(id),
        });
        router.push(`/protected/events/${id}`);
      }
    },
  });
}

/**
 * 이벤트 삭제 mutation
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
        router.push("/protected/events");
      }
    },
  });
}

/**
 * 이벤트 참여 신청 mutation
 */
export function useApplyEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applyEvent(eventId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: eventQueryKeys.detail(eventId),
        });
        queryClient.invalidateQueries({
          queryKey: eventQueryKeys.joinedEvents(),
        });
      }
    },
  });
}

/**
 * 참여자 상태 변경 mutation (승인/거절)
 */
export function useUpdateMemberStatus(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: "approved" | "rejected";
    }) => updateMemberStatus(memberId, status),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: eventQueryKeys.detail(eventId),
        });
      }
    },
  });
}
