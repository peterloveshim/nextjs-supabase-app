"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Event,
  type EventStatus,
  type MemberStatus,
} from "@/lib/mock-data";

// 날짜 포맷 유틸: YYYY년 MM월 DD일 HH:mm
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

// 이벤트 상태 뱃지 색상 및 레이블
function getStatusBadge(status: EventStatus) {
  switch (status) {
    case "open":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          모집 중
        </Badge>
      );
    case "closed":
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
          마감
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          취소됨
        </Badge>
      );
  }
}

// 참여 상태 뱃지 색상 및 레이블
function getMemberStatusBadge(status: MemberStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          승인 대기
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          승인됨
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          거절됨
        </Badge>
      );
  }
}

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/protected/events/${event.id}`);
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">
            {event.title}
          </CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {getStatusBadge(event.status)}
            {event.myStatus && getMemberStatusBadge(event.myStatus)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        {/* 장소 */}
        <p className="line-clamp-1">
          <span className="font-medium text-foreground">장소</span>{" "}
          {event.location}
        </p>
        {/* 날짜 */}
        <p>
          <span className="font-medium text-foreground">일시</span>{" "}
          {formatDate(event.startAt)}
        </p>
        {/* 정원 */}
        <p>
          <span className="font-medium text-foreground">정원</span>{" "}
          {event.currentCount} / {event.capacity}명
        </p>
      </CardContent>
    </Card>
  );
}
