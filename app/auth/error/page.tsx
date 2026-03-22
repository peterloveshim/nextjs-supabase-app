import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function resolveErrorMessage(error: string | undefined): string {
  if (!error) return "알 수 없는 오류가 발생했습니다.";

  const lower = error.toLowerCase();
  if (
    lower.includes("identity is already linked") ||
    lower.includes("identity already linked")
  ) {
    return "이미 다른 방법으로 가입된 이메일입니다. 기존 로그인 방법으로 로그인 후 계정을 연결할 수 있습니다.";
  }

  return `오류가 발생했습니다: ${error}`;
}

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  const errorMessage = resolveErrorMessage(params?.error);

  return <p className="text-muted-foreground text-sm">{errorMessage}</p>;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">오류가 발생했습니다.</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
