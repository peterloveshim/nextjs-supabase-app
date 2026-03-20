"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type EventDetail,
  type EventMember,
  type MemberStatus,
} from "@/lib/mock-data";

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
  event: EventDetail;
  // 주최자 여부
  isHost: boolean;
  // 현재 로그인한 사용자 ID (Mock: 'current-user')
  currentUserId?: string;
};

export function MembersTab({
  event,
  isHost,
  currentUserId = "current-user",
}: MembersTabProps) {
  // 승인된 참여자 수 계산
  const approvedCount = event.members.filter(
    (m) => m.status === "approved"
  ).length;

  // 현재 사용자의 참여 상태 확인
  const myMember = event.members.find((m) => m.userId === currentUserId);
  const isApproved = myMember?.status === "approved";

  // Mock 승인 처리
  const handleApprove = (member: EventMember) => {
    console.log("멤버 승인:", member);
  };

  // Mock 거절 처리
  const handleReject = (member: EventMember) => {
    console.log("멤버 거절:", member);
  };

  // Mock 참여 신청 처리
  const handleJoinRequest = () => {
    console.log("참여 신청:", { eventId: event.id, userId: currentUserId });
  };

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
        {!isHost && !isApproved && (
          <Button size="sm" onClick={handleJoinRequest}>
            {myMember ? "재신청" : "참여 신청"}
          </Button>
        )}
      </div>

      {/* 참여자 목록 */}
      <div className="divide-y rounded-lg border">
        {event.members.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            아직 참여 신청자가 없습니다.
          </p>
        ) : (
          event.members.map((member) => (
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
                    onClick={() => handleApprove(member)}
                  >
                    승인
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleReject(member)}
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
