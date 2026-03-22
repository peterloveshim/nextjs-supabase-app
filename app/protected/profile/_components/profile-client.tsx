"use client";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useHostedEvents, useJoinedEventsPaginated } from "@/hooks/use-profile";
import type { ProfileData } from "@/lib/types/profile";

import { EventListPanel } from "./event-list-panel";
import { ProfileCard } from "./profile-card";

type ProfileClientProps = {
  initialProfile: ProfileData | null;
};

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  // URL 파라미터 동기화 (nuqs)
  const [hostedPage, setHostedPage] = useQueryState(
    "hosted_page",
    parseAsInteger.withDefault(1)
  );
  const [hostedSearch, setHostedSearch] = useQueryState(
    "hosted_search",
    parseAsString.withDefault("")
  );
  const [joinedPage, setJoinedPage] = useQueryState(
    "joined_page",
    parseAsInteger.withDefault(1)
  );
  const [joinedSearch, setJoinedSearch] = useQueryState(
    "joined_search",
    parseAsString.withDefault("")
  );

  // 이벤트 데이터 조회
  const { data: hostedData, isLoading: isHostedLoading } = useHostedEvents(
    hostedPage,
    hostedSearch
  );
  const { data: joinedData, isLoading: isJoinedLoading } =
    useJoinedEventsPaginated(joinedPage, joinedSearch);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">내 프로필</h1>

      {/* 2열 레이아웃: 모바일은 1열, lg 이상 [320px / 1fr] */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* 좌측: 프로필 카드 */}
        <ProfileCard initialProfile={initialProfile} />

        {/* 우측: 이벤트 패널 */}
        <div className="flex flex-col gap-6">
          {/* 주최한 이벤트 */}
          <div className="rounded-lg border p-6">
            <EventListPanel
              title="주최한 이벤트"
              events={hostedData?.data ?? []}
              total={hostedData?.total ?? 0}
              page={hostedPage}
              search={hostedSearch}
              isLoading={isHostedLoading}
              onPageChange={setHostedPage}
              onSearchChange={setHostedSearch}
            />
          </div>

          {/* 참여 중인 이벤트 */}
          <div className="rounded-lg border p-6">
            <EventListPanel
              title="참여 중인 이벤트"
              events={joinedData?.data ?? []}
              total={joinedData?.total ?? 0}
              page={joinedPage}
              search={joinedSearch}
              isLoading={isJoinedLoading}
              onPageChange={setJoinedPage}
              onSearchChange={setJoinedSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
