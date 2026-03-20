// 서버 컴포넌트: params를 받아 id를 클라이언트 컴포넌트에 전달
import { EditEventClient } from "../_components/edit-event-client";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  return <EditEventClient id={id} />;
}
