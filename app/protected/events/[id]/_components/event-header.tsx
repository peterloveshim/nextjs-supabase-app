"use client";

import { Copy, ImageIcon, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventDetailView, EventStatus } from "@/lib/types/event";

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

// 이벤트 상태 뱃지
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

type EventHeaderProps = {
  event: EventDetailView;
  // 주최자 여부: 수정/삭제 버튼 표시
  isHost: boolean;
  onDeleteClick: () => void;
};

export function EventHeader({
  event,
  isHost,
  onDeleteClick,
}: EventHeaderProps) {
  const [copied, setCopied] = useState(false);

  // 현재 페이지 링크를 클립보드에 복사 (autoJoin=true 파라미터 포함)
  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/protected/events/${event.id}?autoJoin=true`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 브라우저 폴백
      alert("링크 복사에 실패했습니다.");
    }
  };

  // 승인된 참여자 수 계산
  const approvedCount = event.members.filter(
    (m) => m.status === "approved"
  ).length;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex">
        {/* 좌측: 텍스트 콘텐츠 */}
        <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">
          {/* 제목 + 상태 뱃지 */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {getStatusBadge(event.status)}
          </div>

          {/* 상세 정보 */}
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">장소</dt>
              <dd className="text-muted-foreground">{event.location}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">일시</dt>
              <dd className="text-muted-foreground">
                {formatDate(event.startAt)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">정원</dt>
              <dd className="text-muted-foreground">
                {approvedCount} / {event.capacity}명
              </dd>
            </div>
            {event.description && (
              <div className="pt-2">
                <dt className="font-medium text-foreground">설명</dt>
                <dd className="mt-1 whitespace-pre-line text-muted-foreground">
                  {event.description}
                </dd>
              </div>
            )}
          </dl>

          {/* 액션 버튼 그룹 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="mr-1 h-4 w-4" />
              {copied ? "복사됨!" : "링크 복사"}
            </Button>
            {isHost && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/protected/events/${event.id}/edit`}>
                    <Pencil className="mr-1 h-4 w-4" />
                    수정
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={onDeleteClick}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 우측: 이미지 (md 미만 숨김, 40% 너비) */}
        <div className="hidden md:block md:w-[40%] md:shrink-0">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
