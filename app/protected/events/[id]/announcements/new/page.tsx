// 공지 작성 페이지 (서버 컴포넌트)
import { AnnouncementForm } from "../_components/announcement-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnnouncementNewPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">공지 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          이벤트 참여자에게 전달할 공지를 작성합니다.
        </p>
      </div>

      <AnnouncementForm eventId={id} />
    </div>
  );
}
