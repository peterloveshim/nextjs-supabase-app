"use client";

import Link from "next/link";
import { parseAsStringEnum, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJoinedEvents, useMyEvents } from "@/hooks/use-events";

import { EventList } from "./event-list";

// 탭 값 타입
type TabValue = "my" | "joined";

type EventsClientProps = {
  // URL searchParams에서 받은 초기 탭 값
  defaultTab?: string;
};

export function EventsClient({ defaultTab }: EventsClientProps) {
  // nuqs로 탭 상태를 URL 쿼리 파라미터에 동기화 (?tab=my)
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum<TabValue>(["my", "joined"]).withDefault(
      (defaultTab as TabValue) ?? "my"
    )
  );

  const { data: myEvents, isLoading: isMyLoading } = useMyEvents();
  const { data: joinedEvents, isLoading: isJoinedLoading } = useJoinedEvents();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이벤트</h1>
        <Button asChild>
          <Link href="/protected/events/new">이벤트 만들기</Link>
        </Button>
      </div>

      {/* 탭 */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="my" className="flex-1 sm:flex-none">
            내가 만든 이벤트
          </TabsTrigger>
          <TabsTrigger value="joined" className="flex-1 sm:flex-none">
            내가 참여하는 이벤트
          </TabsTrigger>
        </TabsList>

        {/* 내가 만든 이벤트 목록 */}
        <TabsContent value="my" className="mt-4">
          {isMyLoading ? (
            <EventListSkeleton />
          ) : (
            <EventList events={myEvents ?? []} isHost />
          )}
        </TabsContent>

        {/* 내가 참여하는 이벤트 목록 */}
        <TabsContent value="joined" className="mt-4">
          {isJoinedLoading ? (
            <EventListSkeleton />
          ) : (
            <EventList events={joinedEvents ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 이벤트 목록 스켈레톤 로딩 UI
function EventListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
