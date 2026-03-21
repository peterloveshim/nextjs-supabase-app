// 카풀 등록 페이지 (서버 컴포넌트)
import { CarpoolForm } from "../_components/carpool-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarpoolNewPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">카풀 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          함께 이동할 카풀을 등록합니다.
        </p>
      </div>

      <CarpoolForm eventId={id} />
    </div>
  );
}
