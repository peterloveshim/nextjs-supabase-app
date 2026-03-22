import { Bell, CalendarDays, Users } from "lucide-react";
import Link from "next/link";

import { HeaderNav } from "@/components/header-nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "이벤트 관리",
    description:
      "모임과 이벤트를 쉽게 만들고 관리하세요. 일정, 장소, 정원까지 한 곳에서.",
    href: "/protected/events",
  },
  {
    icon: Users,
    title: "참여자 관리",
    description: "참여 신청을 받고, 승인·거절을 간편하게 처리하세요.",
    href: "/protected/events",
  },
  {
    icon: Bell,
    title: "실시간 알림",
    description: "이벤트 변경사항과 참여 신청 현황을 알림으로 받아보세요.",
    href: "/protected/notifications",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;
  const email = data?.claims?.email ?? undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav email={email} />

      {/* 히어로 섹션 */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center md:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          모임을 더 쉽게, <span className="text-primary">모임이음</span>
        </h1>
        <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
          이벤트 생성부터 참여자 관리, 알림까지. 모임 운영에 필요한 모든 것을 한
          곳에서 해결하세요.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/protected/events">시작하기</Link>
          </Button>
          {!isLoggedIn && (
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">로그인</Link>
            </Button>
          )}
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 md:pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold">주요 기능</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <feature.icon className="text-primary mb-2 h-8 w-8" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <footer className="text-muted-foreground border-t py-8 text-center text-sm">
        © 2026 모임이음. All rights reserved.
      </footer>
    </div>
  );
}
