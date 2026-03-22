"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchHostedEvents,
  fetchJoinedEventsPaginated,
  fetchProfile,
  updateProfile,
} from "@/app/protected/profile/actions";
import type { PaginatedEvents, ProfileData } from "@/lib/types/profile";
import type { ProfileFormValues } from "@/lib/validations/profile";

// 쿼리 키 상수
export const profileQueryKeys = {
  all: ["profile"] as const,
  profile: () => [...profileQueryKeys.all] as const,
  hostedEvents: (page: number, search: string) =>
    [...profileQueryKeys.all, "hosted-events", page, search] as const,
  joinedEvents: (page: number, search: string) =>
    [...profileQueryKeys.all, "joined-events", page, search] as const,
};

/**
 * 현재 사용자 프로필 조회
 */
export function useProfile(initialData?: ProfileData | null) {
  return useQuery<ProfileData | null>({
    queryKey: profileQueryKeys.profile(),
    queryFn: () => fetchProfile(),
    initialData: initialData ?? undefined,
  });
}

/**
 * 프로필 수정 mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues) => updateProfile(values),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile() });
        toast.success("프로필이 저장되었습니다.");
      } else {
        toast.error(result.error ?? "저장에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("저장 중 오류가 발생했습니다.");
    },
  });
}

/**
 * 주최한 이벤트 목록 조회 (페이지네이션 + 검색)
 */
export function useHostedEvents(page: number, search: string) {
  return useQuery<PaginatedEvents>({
    queryKey: profileQueryKeys.hostedEvents(page, search),
    queryFn: () => fetchHostedEvents({ page, search }),
  });
}

/**
 * 참여 중인 이벤트 목록 조회 (페이지네이션 + 검색)
 */
export function useJoinedEventsPaginated(page: number, search: string) {
  return useQuery<PaginatedEvents>({
    queryKey: profileQueryKeys.joinedEvents(page, search),
    queryFn: () => fetchJoinedEventsPaginated({ page, search }),
  });
}
