// 서버 컴포넌트: params/searchParams를 받아 클라이언트 컴포넌트에 전달
import { EventDetailClient } from "./_components/event-detail-client";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoJoin?: string; tab?: string }>;
};

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { id } = await params;
  const { autoJoin, tab } = await searchParams;

  return (
    <EventDetailClient
      id={id}
      autoJoin={autoJoin === "true"}
      defaultTab={tab}
    />
  );
}
