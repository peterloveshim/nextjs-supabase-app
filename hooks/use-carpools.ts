"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { CarpoolView } from "@/app/protected/events/[id]/carpools/actions";
import {
  createCarpool,
  fetchCarpools,
  joinCarpool,
  leaveCarpool,
} from "@/app/protected/events/[id]/carpools/actions";
import type { CarpoolFormValues } from "@/lib/validations/carpool";

// 쿼리 키 상수
export const carpoolQueryKeys = {
  all: ["carpools"] as const,
  byEvent: (eventId: string) =>
    [...carpoolQueryKeys.all, "byEvent", eventId] as const,
};

/**
 * 이벤트 카풀 목록 조회
 */
export function useCarpools(eventId: string) {
  return useQuery<CarpoolView[]>({
    queryKey: carpoolQueryKeys.byEvent(eventId),
    queryFn: () => fetchCarpools(eventId),
    enabled: !!eventId,
  });
}

/**
 * 카풀 등록 mutation
 * - 성공 시 카풀 목록 캐시 무효화 + 이전 페이지로 이동
 */
export function useCreateCarpool(eventId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: CarpoolFormValues) => createCarpool(eventId, values),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: carpoolQueryKeys.byEvent(eventId),
        });
        toast.success("카풀이 등록되었습니다.");
        router.back();
      } else {
        toast.error(result.error ?? "카풀 등록에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("카풀 등록 중 오류가 발생했습니다.");
    },
  });
}

/**
 * 카풀 탑승 신청 mutation
 * - 성공 시 카풀 목록 캐시 무효화
 */
export function useJoinCarpool(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: string) => joinCarpool(carpoolId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: carpoolQueryKeys.byEvent(eventId),
        });
        toast.success("탑승 신청이 완료되었습니다.");
      } else {
        toast.error(result.error ?? "탑승 신청에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("탑승 신청 중 오류가 발생했습니다.");
    },
  });
}

/**
 * 카풀 탑승 취소 mutation
 * - 성공 시 카풀 목록 캐시 무효화
 */
export function useLeaveCarpool(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: string) => leaveCarpool(carpoolId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: carpoolQueryKeys.byEvent(eventId),
        });
        toast.success("탑승이 취소되었습니다.");
      } else {
        toast.error(result.error ?? "탑승 취소에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("탑승 취소 중 오류가 발생했습니다.");
    },
  });
}
