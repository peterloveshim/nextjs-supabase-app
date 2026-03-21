"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { AnnouncementView } from "@/app/protected/events/[id]/announcements/actions";
import {
  createAnnouncement,
  fetchAnnouncements,
} from "@/app/protected/events/[id]/announcements/actions";
import type { AnnouncementFormValues } from "@/lib/validations/announcement";

// 쿼리 키 상수
export const announcementQueryKeys = {
  all: ["announcements"] as const,
  byEvent: (eventId: string) =>
    [...announcementQueryKeys.all, "byEvent", eventId] as const,
};

/**
 * 이벤트 공지 목록 조회
 */
export function useAnnouncements(eventId: string) {
  return useQuery<AnnouncementView[]>({
    queryKey: announcementQueryKeys.byEvent(eventId),
    queryFn: () => fetchAnnouncements(eventId),
    enabled: !!eventId,
  });
}

/**
 * 공지 작성 mutation
 * - 성공 시 공지 목록 캐시 무효화 + 이전 페이지로 이동
 */
export function useCreateAnnouncement(eventId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: AnnouncementFormValues) =>
      createAnnouncement(eventId, values),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: announcementQueryKeys.byEvent(eventId),
        });
        toast.success("공지가 작성되었습니다.");
        router.back();
      } else {
        toast.error(result.error ?? "공지 작성에 실패했습니다.");
      }
    },
    onError: () => {
      toast.error("공지 작성 중 오류가 발생했습니다.");
    },
  });
}
