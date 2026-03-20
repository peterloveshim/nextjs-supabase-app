import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ redirect_to?: string }>;
};

// searchParams를 Suspense 경계 안에서 처리하는 내부 컴포넌트
async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  const { redirect_to } = await searchParams;
  return <LoginForm redirectTo={redirect_to} />;
}

export default function Page({ searchParams }: LoginPageProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginForm />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
