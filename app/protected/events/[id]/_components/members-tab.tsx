"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  EventDetailView,
  EventMemberWithProfile,
  MemberStatus,
} from "@/lib/types/event";

// 날짜 포맷 유틸: YYYY년 MM월 DD일
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
}

// 참여 상태 뱃지
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

type MembersTabProps = {
  event: EventDetailView;
  // 주최자 여부
  isHost: boolean;
  // 현재 로그인한 사용자 ID
  currentUserId?: string;
  // 참여 신청 핸들러
  onApplyEvent?: () => void;
  // 멤버 상태 변경 핸들러 (주최자 전용)
  onUpdateMemberStatus?: (
    memberId: string,
    status: "approved" | "rejected"
  ) => void;
  // mutation 로딩 상태
  isApplying?: boolean;
  isUpdatingMember?: boolean;
};

export function MembersTab({
  event,
  isHost,
  currentUserId,
  onApplyEvent,
  onUpdateMemberStatus,
  isApplying = false,
  isUpdatingMember = false,
}: MembersTabProps) {
  // 승인된 참여자 수 계산
  const approvedCount = event.members.filter(
    (m) => m.status === "approved"
  ).length;

  // 현재 사용자의 참여 상태 확인
  const myMember = currentUserId
    ? event.members.find((m) => m.userId === currentUserId)
    : undefined;
  const isApproved = myMember?.status === "approved";
  const isPending = myMember?.status === "pending";

  return (
    <div className="space-y-4">
      {/* 참여자 카운트 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          승인된 참여자{" "}
          <span className="font-bold text-foreground">{approvedCount}</span> /{" "}
          {event.capacity}명
        </p>

        {/* 비주최자이고 아직 미승인 상태인 경우 참여 신청 버튼 */}
        {!isHost && !isApproved && !isPending && (
          <Button
            size="sm"
            onClick={onApplyEvent}
            disabled={isApplying || event.status !== "open"}
          >
            {isApplying ? "신청 중..." : "참여 신청"}
          </Button>
        )}

        {/* 대기 중 상태 표시 */}
        {!isHost && isPending && (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            승인 대기 중
          </Badge>
        )}
      </div>

      {/* 참여자 목록 */}
      <div className="divide-y rounded-lg border">
        {event.members.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            아직 참여 신청자가 없습니다.
          </p>
        ) : (
          event.members.map((member: EventMemberWithProfile) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              {/* 멤버 정보 */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  신청일: {formatDate(member.joinedAt)}
                </p>
              </div>

              {/* 상태 뱃지 */}
              <div className="shrink-0">
                {getMemberStatusBadge(member.status)}
              </div>

              {/* 주최자 전용: 승인/거절 버튼 */}
              {isHost && member.status === "pending" && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-700 hover:bg-green-50 hover:text-green-700"
                    disabled={isUpdatingMember}
                    onClick={() =>
                      onUpdateMemberStatus?.(member.id, "approved")
                    }
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-600"
                    disabled={isUpdatingMember}
                    onClick={() =>
                      onUpdateMemberStatus?.(member.id, "rejected")
                    }
                  >
                    거절
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
