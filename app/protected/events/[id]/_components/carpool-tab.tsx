"use client";

import { Car, Lock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCarpools,
  useJoinCarpool,
  useLeaveCarpool,
} from "@/hooks/use-carpools";

type CarpoolTabProps = {
  eventId: string;
  // 자격 있는 사용자 여부 (주최자 || 승인된 참여자)
  isEligible: boolean;
  // 현재 로그인한 사용자 ID
  currentUserId?: string;
};

export function CarpoolTab({
  eventId,
  isEligible,
  currentUserId,
}: CarpoolTabProps) {
  const { data: carpools, isLoading } = useCarpools(eventId);
  const { mutate: joinCarpool, isPending: isJoining } = useJoinCarpool(eventId);
  const { mutate: leaveCarpool, isPending: isLeaving } =
    useLeaveCarpool(eventId);

  // 비자격 사용자: 접근 제한 안내
  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Lock className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          승인된 참여자 또는 주최자만 카풀을 이용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더: 카풀 등록 버튼 */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          카풀{" "}
          <span className="font-bold text-foreground">
            {isLoading ? "-" : (carpools?.length ?? 0)}
          </span>
          개
        </p>
        <Button size="sm" asChild>
          <Link href={`/protected/events/${eventId}/carpools/new`}>
            카풀 등록
          </Link>
        </Button>
      </div>

      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* 카풀 목록 */}
      {!isLoading && (
        <>
          {!carpools || carpools.length === 0 ? (
            // 빈 상태
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Car className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                등록된 카풀이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {carpools.map((carpool) => {
                // 잔여 좌석 계산
                const remainingSeats = carpool.seats - carpool.takenSeats;
                const isFull = remainingSeats <= 0;
                // 내가 드라이버인지 판별
                const isDriver = currentUserId === carpool.driverId;
                // isJoined는 서버에서 계산된 값 사용
                const isJoined = carpool.isJoined;

                return (
                  <Card key={carpool.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">
                          {carpool.driverName}
                        </CardTitle>
                        {/* 내 카풀 뱃지 (드라이버인 경우) */}
                        {isDriver && (
                          <Badge variant="secondary" className="shrink-0">
                            내 카풀
                          </Badge>
                        )}
                        {/* 만석 뱃지 */}
                        {!isDriver && isFull && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-muted-foreground"
                          >
                            만석
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 출발지 및 좌석 정보 */}
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            출발지:{" "}
                          </span>
                          {carpool.departureLocation}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            잔여 좌석:{" "}
                          </span>
                          <span
                            className={
                              isFull
                                ? "font-medium text-destructive"
                                : "font-medium"
                            }
                          >
                            {remainingSeats}
                          </span>
                          <span className="text-muted-foreground">
                            /{carpool.seats}
                          </span>
                        </p>
                        {/* 메모 (있는 경우만) */}
                        {carpool.note && (
                          <p className="text-muted-foreground">
                            {carpool.note}
                          </p>
                        )}
                      </div>

                      {/* 탑승 버튼 영역: 드라이버가 아닌 경우만 표시 */}
                      {!isDriver && (
                        <div className="pt-1">
                          {isJoined ? (
                            // 탑승 신청 완료: 취소 버튼
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isLeaving}
                              onClick={() => leaveCarpool(carpool.id)}
                            >
                              {isLeaving ? "취소 중..." : "탑승 취소"}
                            </Button>
                          ) : (
                            // 탑승 신청 버튼 (만석이면 비활성화)
                            <Button
                              size="sm"
                              disabled={isFull || isJoining}
                              onClick={() => joinCarpool(carpool.id)}
                            >
                              {isJoining ? "신청 중..." : "탑승 신청"}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
