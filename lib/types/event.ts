// 이벤트 관련 UI 타입 정의
// DB 타입(database.types.ts)과 별개로 UI에서 사용하는 확장 타입

export type EventStatus = "open" | "closed" | "cancelled";
export type MemberStatus = "pending" | "approved" | "rejected";

// 목록 화면용 이벤트 타입 (DB Row + 계산 필드)
export type EventListItem = {
  id: string;
  title: string;
  location: string;
  startAt: string;
  capacity: number;
  status: EventStatus;
  // 승인된 참여자 수 (event_members WHERE status='approved' COUNT)
  approvedCount: number;
  // 내가 참여 신청한 경우의 상태 (joined events 탭에서 사용)
  myStatus?: MemberStatus;
  // 이벤트 대표 이미지 URL (없으면 null)
  imageUrl: string | null;
};

// 참여자 타입 (DB Row + 프로필 조인)
export type EventMemberWithProfile = {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: MemberStatus;
  joinedAt: string;
};

// 상세 화면용 이벤트 타입
export type EventDetailView = {
  id: string;
  hostId: string;
  hostName: string | null;
  title: string;
  description: string | null;
  location: string;
  startAt: string;
  capacity: number;
  status: EventStatus;
  members: EventMemberWithProfile[];
  // 이벤트 대표 이미지 URL (없으면 null)
  imageUrl: string | null;
};
