"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { ImageUpload } from "@/components/events/image-upload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { eventFormSchema, type EventFormValues } from "@/lib/validations/event";

// Date 또는 문자열을 datetime-local input 형식으로 변환 (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(date: Date | string | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

type EventFormProps = {
  // 수정 시 기본값 (생성 시 없음)
  defaultValues?: {
    title?: string;
    description?: string;
    location?: string;
    startAt?: Date | string;
    capacity?: number;
    status?: "open" | "closed" | "cancelled";
    imageUrl?: string | null;
  };
  // 수정 모드 여부 (상태 셀렉트 표시)
  isEdit?: boolean;
  onSubmit: (data: EventFormValues) => void;
  // 제출 중 여부 (버튼 비활성화)
  isSubmitting?: boolean;
  // 이미지 업로드를 위한 현재 사용자 ID
  userId: string;
};

export function EventForm({
  defaultValues,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
  userId,
}: EventFormProps) {
  const router = useRouter();

  const form = useForm<EventFormValues>({
    // Zod 유효성 검사 연결
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      location: defaultValues?.location ?? "",
      // startAt은 datetime-local 형식 문자열로 저장
      startAt: toDatetimeLocal(defaultValues?.startAt),
      capacity: defaultValues?.capacity ?? 10,
      status: defaultValues?.status,
      imageUrl: defaultValues?.imageUrl ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 제목 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                제목 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="이벤트 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 설명 (선택) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대한 설명을 입력하세요 (선택)"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 장소 */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                장소 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="이벤트 장소를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 날짜/시간 */}
        <FormField
          control={form.control}
          name="startAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                날짜/시간 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 정원 */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                정원 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="1 ~ 100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이미지 업로드 (선택) */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이미지</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ?? null}
                  onChange={(url) => field.onChange(url ?? "")}
                  userId={userId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 상태 셀렉트 (수정 모드에서만 표시) */}
        {isEdit && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">모집 중</SelectItem>
                    <SelectItem value="closed">마감</SelectItem>
                    <SelectItem value="cancelled">취소됨</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 sm:flex-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : isEdit ? "수정하기" : "만들기"}
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
