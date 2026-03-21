"use client";

import { toast } from "sonner";

import { useCreateEvent, useCurrentUserId } from "@/hooks/use-events";
import type { EventFormValues } from "@/lib/validations/event";

import { EventForm } from "./event-form";

export function NewEventClient() {
  const { mutate: createEvent, isPending } = useCreateEvent();
  // 이미지 업로드 경로 생성을 위한 현재 사용자 ID
  const { data: userId } = useCurrentUserId();

  // 이벤트 생성 제출 처리
  const handleSubmit = (data: EventFormValues) => {
    createEvent(data, {
      onSuccess: (result) => {
        if (!result.success) {
          toast.error(result.error ?? "이벤트 생성에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("이벤트 생성 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">이벤트 만들기</h1>
      {userId && (
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          userId={userId}
        />
      )}
    </div>
  );
}
