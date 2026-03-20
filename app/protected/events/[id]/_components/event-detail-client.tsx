"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApplyEvent,
  useCurrentUserId,
  useDeleteEvent,
  useEventDetail,
  useUpdateMemberStatus,
} from "@/hooks/use-events";

import { DeleteConfirmDialog } from "../../_components/delete-confirm-dialog";
import { AnnouncementsTab } from "./announcements-tab";
import { CarpoolTab } from "./carpool-tab";
import { EventHeader } from "./event-header";
import { MembersTab } from "./members-tab";
import { SettlementTab } from "./settlement-tab";

// 탭 값 타입
type TabValue = "announcements" | "members" | "carpool" | "settlement";

type EventDetailClientProps = {
  id: string;
  // ?autoJoin=true: 링크 공유를 통해 접근한 경우 자동 참여 신청
  autoJoin?: boolean;
  // URL ?tab= 파라미터 초기값
  defaultTab?: string;
};

export function EventDetailClient({
  id,
  autoJoin = false,
  defaultTab,
}: EventDetailClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // 자동 신청 실행 여부 추적 (중복 실행 방지)
  const autoJoinFiredRef = useRef(false);

  // nuqs로 탭 상태를 URL 쿼리 파라미터에 동기화 (?tab=members)
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault(defaultTab ?? "members")
  );

  // 데이터 조회
  const { data: event, isLoading: isEventLoading } = useEventDetail(id);
  const { data: currentUserId } = useCurrentUserId();

  // 현재 사용자가 주최자인지 판별
  const isHost = !!currentUserId && !!event && currentUserId === event.hostId;

  // Mutation 훅
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: applyEvent, isPending: isApplying } = useApplyEvent(id);
  const { mutate: updateMemberStatus, isPending: isUpdatingMember } =
    useUpdateMemberStatus(id);

  // autoJoin 자동 참여 신청 처리
  // 데이터 로드 완료 후 한 번만 실행 (중복 방지)
  useEffect(() => {
    if (!autoJoin) return;
    if (autoJoinFiredRef.current) return;
    if (isEventLoading || !event || !currentUserId) return;

    // 주최자는 자동 신청 불필요
    if (isHost) return;

    // 이미 신청했거나 승인된 경우 중복 신청 없이 종료
    const myMember = event.members.find((m) => m.userId === currentUserId);
    if (myMember?.status === "pending" || myMember?.status === "approved") {
      return;
    }

    // 자동 참여 신청 실행
    autoJoinFiredRef.current = true;
    applyEvent(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("참여 신청이 자동으로 완료되었습니다.");
        } else {
          // 이미 신청된 경우 등 graceful 처리
          if (result.error?.includes("이미")) {
            return;
          }
          toast.error(result.error ?? "자동 참여 신청에 실패했습니다.");
        }
      },
    });
  }, [autoJoin, isEventLoading, event, currentUserId, isHost, applyEvent]);

  // 이벤트 삭제 처리
  const handleDelete = () => {
    deleteEvent(id, {
      onSuccess: (result) => {
        if (!result.success) {
          toast.error(result.error ?? "이벤트 삭제에 실패했습니다.");
          setDeleteDialogOpen(false);
        }
      },
      onError: () => {
        toast.error("이벤트 삭제 중 오류가 발생했습니다.");
        setDeleteDialogOpen(false);
      },
    });
  };

  // 참여 신청 처리
  const handleApplyEvent = () => {
    applyEvent(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("참여 신청이 완료되었습니다.");
        } else {
          toast.error(result.error ?? "참여 신청에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("참여 신청 중 오류가 발생했습니다.");
      },
    });
  };

  // 멤버 상태 변경 처리 (주최자)
  const handleUpdateMemberStatus = (
    memberId: string,
    status: "approved" | "rejected"
  ) => {
    updateMemberStatus(
      { memberId, status },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(
              status === "approved"
                ? "참여를 승인했습니다."
                : "참여를 거절했습니다."
            );
          } else {
            toast.error(result.error ?? "상태 변경에 실패했습니다.");
          }
        },
        onError: () => {
          toast.error("상태 변경 중 오류가 발생했습니다.");
        },
      }
    );
  };

  if (isEventLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4 rounded-lg border p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">이벤트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 이벤트 헤더 (제목, 장소, 날짜, 정원, 상태, 링크 복사, 수정/삭제) */}
      <EventHeader
        event={event}
        isHost={isHost}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      {/* 탭 - URL 쿼리 파라미터로 상태 관리 */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="announcements" className="flex-1 sm:flex-none">
            공지
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1 sm:flex-none">
            참여자
          </TabsTrigger>
          <TabsTrigger value="carpool" className="flex-1 sm:flex-none">
            카풀
          </TabsTrigger>
          <TabsTrigger value="settlement" className="flex-1 sm:flex-none">
            정산
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersTab
            event={event}
            isHost={isHost}
            currentUserId={currentUserId ?? undefined}
            onApplyEvent={handleApplyEvent}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            isApplying={isApplying}
            isUpdatingMember={isUpdatingMember}
          />
        </TabsContent>

        <TabsContent value="carpool" className="mt-4">
          <CarpoolTab />
        </TabsContent>

        <TabsContent value="settlement" className="mt-4">
          <SettlementTab />
        </TabsContent>
      </Tabs>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
