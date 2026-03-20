"use client";

import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEventDetail } from "@/lib/mock-data";

import { DeleteConfirmDialog } from "../_components/delete-confirm-dialog";
import { AnnouncementsTab } from "./_components/announcements-tab";
import { CarpoolTab } from "./_components/carpool-tab";
import { EventHeader } from "./_components/event-header";
import { MembersTab } from "./_components/members-tab";
import { SettlementTab } from "./_components/settlement-tab";

// 탭 값 타입
type TabValue = "announcements" | "members" | "carpool" | "settlement";

export default function EventDetailPage() {
  const router = useRouter();

  // nuqs로 탭 상태를 URL 쿼리 파라미터에 동기화 (?tab=members)
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("members")
  );

  // Mock 역할 토글 (개발 전용 - Task 006에서 실제 인증으로 교체 예정)
  const [isHost, setIsHost] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock 삭제 처리
  const handleDelete = () => {
    console.log("이벤트 삭제:", mockEventDetail.id);
    setDeleteDialogOpen(false);
    alert("이벤트가 삭제되었습니다.");
    router.push("/protected/events");
  };

  return (
    <div className="space-y-6">
      {/* 개발 전용 역할 토글 */}
      <div className="flex items-center gap-2 rounded-md border border-dashed border-orange-400 bg-orange-50 px-3 py-2 dark:border-orange-600 dark:bg-orange-950">
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200">
          DEV
        </Badge>
        <span className="text-sm text-orange-800 dark:text-orange-200">
          현재 역할: <strong>{isHost ? "주최자" : "참여자"}</strong>
        </span>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto border-orange-400 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300"
          onClick={() => setIsHost((prev) => !prev)}
        >
          {isHost ? "참여자로 전환" : "주최자로 전환"}
        </Button>
      </div>

      {/* 이벤트 헤더 (제목, 장소, 날짜, 정원, 상태, 링크 복사, 수정/삭제) */}
      <EventHeader
        event={mockEventDetail}
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
            event={mockEventDetail}
            isHost={isHost}
            // Mock 현재 사용자 ID (비주최자 상태 확인용)
            currentUserId={isHost ? "host-user" : "current-user"}
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
      />
    </div>
  );
}
