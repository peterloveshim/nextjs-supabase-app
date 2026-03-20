// Mock 데이터 타입 정의 및 샘플 데이터

export type EventStatus = "open" | "closed" | "cancelled";
export type MemberStatus = "pending" | "approved" | "rejected";

export type Event = {
  id: string;
  title: string;
  location: string;
  startAt: string;
  capacity: number;
  currentCount: number;
  status: EventStatus;
  myStatus?: MemberStatus;
};

export type EventMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: MemberStatus;
  joinedAt: string;
};

export type EventDetail = Event & {
  members: EventMember[];
  description?: string;
};

// 내가 만든 이벤트 Mock 데이터
export const myEvents: Event[] = [
  {
    id: "event-1",
    title: "개발자 네트워킹 밋업",
    location: "서울 강남구 테헤란로 123 위워크 3층",
    startAt: "2026-04-15T19:00:00+09:00",
    capacity: 30,
    currentCount: 18,
    status: "open",
  },
  {
    id: "event-2",
    title: "프론트엔드 스터디 모임",
    location: "서울 마포구 합정동 공유 오피스",
    startAt: "2026-04-20T14:00:00+09:00",
    capacity: 10,
    currentCount: 10,
    status: "closed",
  },
  {
    id: "event-3",
    title: "사이드 프로젝트 데모데이",
    location: "서울 성동구 성수동 카페",
    startAt: "2026-03-28T13:00:00+09:00",
    capacity: 20,
    currentCount: 5,
    status: "cancelled",
  },
];

// 내가 참여하는 이벤트 Mock 데이터
export const joinedEvents: Event[] = [
  {
    id: "event-4",
    title: "리액트 19 새기능 공유 세미나",
    location: "온라인 (Zoom)",
    startAt: "2026-04-10T20:00:00+09:00",
    capacity: 50,
    currentCount: 32,
    status: "open",
    myStatus: "approved",
  },
  {
    id: "event-5",
    title: "TypeScript 고급 패턴 워크샵",
    location: "서울 종로구 광화문 아마존웍스",
    startAt: "2026-04-25T10:00:00+09:00",
    capacity: 15,
    currentCount: 8,
    status: "open",
    myStatus: "pending",
  },
  {
    id: "event-6",
    title: "AI 개발 도구 활용 밋업",
    location: "서울 강서구 마곡 LG사이언스파크",
    startAt: "2026-04-05T18:30:00+09:00",
    capacity: 25,
    currentCount: 20,
    status: "open",
    myStatus: "rejected",
  },
];

// 이벤트 상세 Mock 데이터 (Task 004에서 사용)
export const mockEventDetail: EventDetail = {
  ...myEvents[0],
  description:
    "매달 정기적으로 진행하는 개발자 네트워킹 밋업입니다. 다양한 분야의 개발자들이 모여 경험을 나누고 인맥을 쌓는 자리입니다. 가볍게 음료를 마시며 자유롭게 이야기 나눠요!",
  members: [
    {
      id: "member-1",
      userId: "user-1",
      name: "김민준",
      email: "minjun.kim@example.com",
      status: "approved",
      joinedAt: "2026-04-01T10:00:00+09:00",
    },
    {
      id: "member-2",
      userId: "user-2",
      name: "이서연",
      email: "seoyeon.lee@example.com",
      status: "approved",
      joinedAt: "2026-04-02T14:30:00+09:00",
    },
    {
      id: "member-3",
      userId: "user-3",
      name: "박도현",
      email: "dohyun.park@example.com",
      status: "pending",
      joinedAt: "2026-04-03T09:15:00+09:00",
    },
    {
      id: "member-4",
      userId: "user-4",
      name: "최지원",
      email: "jiwon.choi@example.com",
      status: "pending",
      joinedAt: "2026-04-04T16:45:00+09:00",
    },
    {
      id: "member-5",
      userId: "user-5",
      name: "정하은",
      email: "haeun.jung@example.com",
      status: "rejected",
      joinedAt: "2026-04-05T11:20:00+09:00",
    },
  ],
};
