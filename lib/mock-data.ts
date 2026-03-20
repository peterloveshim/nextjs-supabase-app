// Mock 데이터는 제거되었습니다. (Task 006: DB 연동 완료)
// 하위 호환을 위해 lib/types/event.ts에서 타입을 재내보냅니다.

export type {
  EventListItem as Event,
  EventDetailView as EventDetail,
  EventMemberWithProfile as EventMember,
  EventStatus,
  MemberStatus,
} from "@/lib/types/event";
