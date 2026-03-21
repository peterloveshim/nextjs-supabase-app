"use client";

import { Lock, Megaphone } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/use-announcements";

// 날짜 포맷 유틸: YYYY년 MM월 DD일 HH:MM
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

type AnnouncementsTabProps = {
  eventId: string;
  // 주최자 여부
  isHost: boolean;
  // 승인된 참여자 여부
  isApprovedMember: boolean;
};

export function AnnouncementsTab({
  eventId,
  isHost,
  isApprovedMember,
}: AnnouncementsTabProps) {
  const { data: announcements, isLoading } = useAnnouncements(eventId);

  // 미승인 비주최자: 접근 제한 안내
  if (!isHost && !isApprovedMember) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Lock className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          주최자 또는 승인된 참여자만 공지를 열람할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더: 주최자에게만 공지 작성 버튼 표시 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          공지{" "}
          <span className="font-bold text-foreground">
            {isLoading ? "-" : (announcements?.length ?? 0)}
          </span>
          건
        </p>
        {isHost && (
          <Button size="sm" asChild>
            <Link href={`/protected/events/${eventId}/announcements/new`}>
              공지 작성
            </Link>
          </Button>
        )}
      </div>

      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* 공지 목록 */}
      {!isLoading && (
        <>
          {!announcements || announcements.length === 0 ? (
            // 빈 상태
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Megaphone className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                등록된 공지가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {announcement.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {announcement.authorName} ·{" "}
                      {formatDateTime(announcement.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* 줄바꿈 유지 */}
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
