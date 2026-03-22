"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  EventListItem,
  EventStatus,
  MemberStatus,
} from "@/lib/types/event";

// 날짜 포맷 유틸
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
function EventStatusBadge({ status }: { status: EventStatus }) {
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

// 참여 상태 뱃지
function MemberStatusBadge({ status }: { status: MemberStatus }) {
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

type EventListPanelProps = {
  title: string;
  events: EventListItem[];
  total: number;
  page: number;
  search: string;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
};

export function EventListPanel({
  title,
  events,
  total,
  page,
  search,
  isLoading,
  onPageChange,
  onSearchChange,
}: EventListPanelProps) {
  const router = useRouter();
  const pageSize = 5;
  const totalPages = Math.ceil(total / pageSize);

  // 검색 디바운스 (300ms)
  const [inputValue, setInputValue] = useState(search);
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== search) {
        onSearchChange(inputValue);
        onPageChange(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // 표시할 페이지 번호 목록 (최대 5개)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 + 검색 */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="shrink-0 text-base font-semibold">{title}</h2>
        <div className="relative max-w-xs min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="이벤트 검색..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* 이벤트 목록 */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border py-8 text-center text-sm">
          {search ? "검색 결과가 없습니다." : "이벤트가 없습니다."}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/protected/events/${event.id}`)}
              className="hover:bg-muted/50 flex cursor-pointer items-start justify-between gap-2 rounded-lg border p-3 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">
                  {event.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDate(event.startAt)} · {event.location}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <EventStatusBadge status={event.status} />
                {event.myStatus && (
                  <MemberStatusBadge status={event.myStatus} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 전체 건수 */}
      {!isLoading && total > 0 && (
        <p className="text-muted-foreground text-xs">총 {total}개</p>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* 첫 페이지 생략 표시 */}
            {getPageNumbers()[0] > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {getPageNumbers()[0] > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {getPageNumbers().map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => onPageChange(p)}
                  isActive={p === page}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* 마지막 페이지 생략 표시 */}
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] <
                  totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && onPageChange(page + 1)}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
