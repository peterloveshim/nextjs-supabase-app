// 카풀 관련 UI 타입 정의

export type CarpoolMemberItem = {
  userId: string;
};

export type CarpoolItem = {
  id: string;
  driverId: string;
  driverName: string;
  departureLocation: string;
  seats: number;
  takenSeats: number;
  note: string | null;
  members: CarpoolMemberItem[];
};
