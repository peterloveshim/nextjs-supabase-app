"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCarpool } from "@/hooks/use-carpools";
import {
  carpoolFormSchema,
  type CarpoolFormValues,
} from "@/lib/validations/carpool";

type CarpoolFormProps = {
  eventId: string;
};

export function CarpoolForm({ eventId }: CarpoolFormProps) {
  const router = useRouter();
  const { mutate: createCarpool, isPending } = useCreateCarpool(eventId);

  const form = useForm<CarpoolFormValues>({
    // Zod 유효성 검사 연결
    resolver: zodResolver(carpoolFormSchema),
    defaultValues: {
      departureLocation: "",
      seats: 4,
      note: "",
    },
  });

  // 카풀 등록 제출
  function handleSubmit(values: CarpoolFormValues) {
    createCarpool(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 출발지 */}
        <FormField
          control={form.control}
          name="departureLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                출발지 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="출발지를 입력하세요 (예: 강남역 11번 출구)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 좌석 수 */}
        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                좌석 수 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="1 ~ 10"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 메모 (선택) */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="탑승자에게 전달할 메모를 입력하세요 (선택)"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 sm:flex-none"
            disabled={isPending}
          >
            {isPending ? "저장 중..." : "등록하기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none"
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
