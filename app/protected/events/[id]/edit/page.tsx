"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { mockEventDetail } from "@/lib/mock-data";
import {
  type EventFormValues,
  toEventSubmitValues,
} from "@/lib/validations/event";

import { DeleteConfirmDialog } from "../../_components/delete-confirm-dialog";
import { EventForm } from "../../_components/event-form";

export default function EditEventPage() {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock 기본값: 첫 번째 이벤트 데이터 프리필
  const defaultValues = {
    title: mockEventDetail.title,
    description: mockEventDetail.description,
    location: mockEventDetail.location,
    startAt: new Date(mockEventDetail.startAt),
    capacity: mockEventDetail.capacity,
    status: mockEventDetail.status,
  };

  // Mock 수정 제출 처리 (Task 006에서 실제 Server Action으로 교체 예정)
  const handleSubmit = (data: EventFormValues) => {
    const submitValues = toEventSubmitValues(data);
    console.log("이벤트 수정 데이터:", submitValues);
    alert("이벤트가 수정되었습니다.");
  };

  // Mock 삭제 처리
  const handleDelete = () => {
    console.log("이벤트 삭제:", mockEventDetail.id);
    setDeleteDialogOpen(false);
    alert("이벤트가 삭제되었습니다.");
    router.push("/protected/events");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이벤트 수정</h1>
        {/* 삭제 버튼 */}
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          삭제
        </Button>
      </div>

      <EventForm defaultValues={defaultValues} isEdit onSubmit={handleSubmit} />

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
