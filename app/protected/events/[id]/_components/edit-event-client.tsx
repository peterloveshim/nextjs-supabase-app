"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteEvent,
  useEventDetail,
  useUpdateEvent,
} from "@/hooks/use-events";
import type { EventFormValues } from "@/lib/validations/event";

import { DeleteConfirmDialog } from "../../_components/delete-confirm-dialog";
import { EventForm } from "../../_components/event-form";

type EditEventClientProps = {
  id: string;
};

export function EditEventClient({ id }: EditEventClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: event, isLoading } = useEventDetail(id);
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent(id);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  // 이벤트 수정 제출 처리
  const handleSubmit = (data: EventFormValues) => {
    updateEvent(data, {
      onSuccess: (result) => {
        if (!result.success) {
          toast.error(result.error ?? "이벤트 수정에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("이벤트 수정 중 오류가 발생했습니다.");
      },
    });
  };

  // 이벤트 삭제 처리
  const handleDelete = () => {
    deleteEvent(id, {
      onSuccess: (result) => {
        if (!result.success) {
          toast.error(result.error ?? "이벤트 삭제에 실패했습니다.");
          setDeleteDialogOpen(false);
        }
      },
      onError: () => {
        toast.error("이벤트 삭제 중 오류가 발생했습니다.");
        setDeleteDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-muted-foreground">이벤트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // EventForm 기본값 구성 (DB 타입 → 폼 타입 변환)
  const defaultValues = {
    title: event.title,
    description: event.description ?? undefined,
    location: event.location,
    startAt: event.startAt,
    capacity: event.capacity,
    status: event.status,
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이벤트 수정</h1>
        {/* 삭제 버튼 */}
        <Button
          variant="destructive"
          disabled={isDeleting}
          onClick={() => setDeleteDialogOpen(true)}
        >
          삭제
        </Button>
      </div>

      <EventForm
        defaultValues={defaultValues}
        isEdit
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
