// Mock 데이터는 제거되었습니다. (Task 006: DB 연동 완료)
// 하위 호환을 위해 lib/types/event.ts에서 타입을 재내보냅니다.

export type {
  EventListItem as Event,
  EventDetailView as EventDetail,
  EventMemberWithProfile as EventMember,
  EventStatus,
  MemberStatus,
} from "@/lib/types/event";

// ─── Task 008: 공지 Mock 데이터 ───────────────────────────────────────────────
import type { AnnouncementItem } from "@/lib/types/announcement";

export const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "announcement-1",
    title: "이벤트 장소 변경 안내",
    authorName: "주최자",
    createdAt: "2026-03-15T10:00:00.000Z",
    content:
      "안녕하세요. 이벤트 장소가 변경되었습니다.\n\n기존: 강남역 2번 출구\n변경: 강남역 11번 출구\n\n혼선이 없으시도록 미리 안내드립니다. 감사합니다.",
  },
  {
    id: "announcement-2",
    title: "준비물 안내",
    authorName: "주최자",
    createdAt: "2026-03-17T14:30:00.000Z",
    content:
      "참여자 여러분께 준비물을 안내드립니다.\n\n- 편한 복장\n- 개인 물통\n- 간식 (선택)\n\n즐거운 시간 되세요!",
  },
  {
    id: "announcement-3",
    title: "당일 집합 시간 재공지",
    authorName: "주최자",
    createdAt: "2026-03-19T09:00:00.000Z",
    content:
      "집합 시간을 오후 2시에서 오후 1시 30분으로 앞당깁니다.\n조금 일찍 와주시면 감사하겠습니다.",
  },
];

// ─── Task 009: 카풀 Mock 데이터 ───────────────────────────────────────────────
import type { CarpoolItem } from "@/lib/types/carpool";

export const mockCarpools: CarpoolItem[] = [
  {
    id: "carpool-1",
    driverId: "mock-user-1",
    driverName: "김운전",
    departureLocation: "강남역 11번 출구",
    seats: 4,
    takenSeats: 2,
    note: "오후 1시 10분 출발 예정입니다. 시간 맞추어 주세요.",
    members: [{ userId: "mock-user-1" }, { userId: "mock-user-2" }],
  },
  {
    id: "carpool-2",
    driverId: "mock-user-3",
    driverName: "이드라이버",
    departureLocation: "선릉역 3번 출구",
    seats: 2,
    takenSeats: 2,
    note: null,
    members: [{ userId: "mock-user-3" }, { userId: "mock-user-4" }],
  },
];
