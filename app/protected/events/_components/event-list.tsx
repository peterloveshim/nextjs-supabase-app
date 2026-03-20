import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { EventListItem } from "@/lib/types/event";

import { EventCard } from "./event-card";

type EventListProps = {
  events: EventListItem[];
  // 주최자 여부: true이면 빈 상태에서 '이벤트 만들기' 버튼 표시
  isHost?: boolean;
};

export function EventList({ events, isHost = false }: EventListProps) {
  // 빈 상태 처리
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">이벤트가 없습니다.</p>
        {isHost && (
          <Button asChild>
            <Link href="/protected/events/new">이벤트 만들기</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
