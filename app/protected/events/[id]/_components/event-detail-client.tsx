"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApplyEvent,
  useCancelMembership,
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
  const [cancelTargetMemberId, setCancelTargetMemberId] = useState<
    string | null
  >(null);
  // 초대 링크로 접근 시 참여 확인 다이얼로그
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);
  // 확인 다이얼로그 표시 여부 추적 (중복 실행 방지)
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

  // 현재 사용자가 승인된 참여자인지 판별
  const isApprovedMember =
    !!currentUserId &&
    !!event &&
    event.members.find((m) => m.userId === currentUserId)?.status ===
      "approved";

  // Mutation 훅
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: applyEvent, isPending: isApplying } = useApplyEvent(id);
  const { mutate: updateMemberStatus, isPending: isUpdatingMember } =
    useUpdateMemberStatus(id);
  const { mutate: cancelMembership, isPending: isCancellingMembership } =
    useCancelMembership(id);

  // 초대 링크로 접근 시 참여 확인 다이얼로그 표시
  // 데이터 로드 완료 후 한 번만 실행 (중복 방지)
  useEffect(() => {
    if (!autoJoin) return;
    if (autoJoinFiredRef.current) return;
    if (isEventLoading || !event || !currentUserId) return;

    // 주최자는 다이얼로그 불필요
    if (isHost) return;

    // 이미 신청했거나 승인된 경우 다이얼로그 표시 불필요
    const myMember = event.members.find((m) => m.userId === currentUserId);
    if (myMember?.status === "pending" || myMember?.status === "approved") {
      return;
    }

    // 참여 확인 다이얼로그 표시
    autoJoinFiredRef.current = true;
    setJoinConfirmOpen(true);
  }, [autoJoin, isEventLoading, event, currentUserId, isHost]);

  // 초대 링크 참여 확인 처리
  const handleConfirmJoin = () => {
    setJoinConfirmOpen(false);
    applyEvent(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("참여 신청이 완료되었습니다.");
        } else {
          if (result.error?.includes("이미")) {
            return;
          }
          toast.error(result.error ?? "참여 신청에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("참여 신청 중 오류가 발생했습니다.");
      },
    });
  };

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

  // 참여 취소 확인 처리
  const handleConfirmCancelMembership = () => {
    if (!cancelTargetMemberId) return;
    cancelMembership(cancelTargetMemberId, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("참여가 취소되었습니다.");
        } else {
          toast.error(result.error ?? "참여 취소에 실패했습니다.");
        }
        setCancelTargetMemberId(null);
      },
      onError: () => {
        toast.error("참여 취소 중 오류가 발생했습니다.");
        setCancelTargetMemberId(null);
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
          <AnnouncementsTab
            eventId={id}
            isHost={isHost}
            isApprovedMember={isApprovedMember}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersTab
            event={event}
            isHost={isHost}
            currentUserId={currentUserId ?? undefined}
            onApplyEvent={handleApplyEvent}
            onUpdateMemberStatus={handleUpdateMemberStatus}
            onCancelMembershipClick={setCancelTargetMemberId}
            isApplying={isApplying}
            isUpdatingMember={isUpdatingMember}
          />
        </TabsContent>

        <TabsContent value="carpool" className="mt-4">
          <CarpoolTab
            eventId={id}
            isEligible={isHost || isApprovedMember}
            currentUserId={currentUserId ?? undefined}
          />
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

      {/* 초대 링크 참여 확인 다이얼로그 */}
      <AlertDialog open={joinConfirmOpen} onOpenChange={setJoinConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트 참여</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground font-semibold">
                {event.title}
              </span>{" "}
              이벤트에 참여 신청하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmJoin}
              disabled={isApplying}
            >
              {isApplying ? "신청 중..." : "참여 신청"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 참여 취소 확인 다이얼로그 */}
      <AlertDialog
        open={cancelTargetMemberId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTargetMemberId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>참여 취소</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 참여자의 참여를 취소하시겠습니까? 취소 후 재신청이
              가능합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelMembership}
              disabled={isCancellingMembership}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancellingMembership ? "취소 중..." : "참여 취소"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
