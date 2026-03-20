// 서버 컴포넌트: searchParams를 받아 클라이언트 컴포넌트에 초기값 전달
import { EventsClient } from "./_components/events-client";

type EventsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { tab } = await searchParams;
  return <EventsClient defaultTab={tab} />;
}
