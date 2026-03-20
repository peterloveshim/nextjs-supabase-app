"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { joinedEvents, myEvents } from "@/lib/mock-data";

import { EventList } from "./_components/event-list";

export default function EventsPage() {
  // 탭 상태 관리 (Task 004에서 nuqs로 전환 예정)
  const [activeTab, setActiveTab] = useState<"my" | "joined">("my");

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
        onValueChange={(v) => setActiveTab(v as "my" | "joined")}
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
          <EventList events={myEvents} isHost />
        </TabsContent>

        {/* 내가 참여하는 이벤트 목록 */}
        <TabsContent value="joined" className="mt-4">
          <EventList events={joinedEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
