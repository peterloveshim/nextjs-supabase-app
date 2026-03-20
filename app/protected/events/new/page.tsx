"use client";

import {
  type EventFormValues,
  toEventSubmitValues,
} from "@/lib/validations/event";

import { EventForm } from "../_components/event-form";

export default function NewEventPage() {
  // Mock 제출 처리 (Task 006에서 실제 Server Action으로 교체 예정)
  const handleSubmit = (data: EventFormValues) => {
    const submitValues = toEventSubmitValues(data);
    console.log("이벤트 생성 데이터:", submitValues);
    alert("이벤트가 생성되었습니다.");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">이벤트 만들기</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
