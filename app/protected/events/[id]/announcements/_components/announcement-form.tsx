"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateAnnouncement } from "@/hooks/use-announcements";
import {
  announcementFormSchema,
  type AnnouncementFormValues,
} from "@/lib/validations/announcement";

type AnnouncementFormProps = {
  eventId: string;
};

export function AnnouncementForm({ eventId }: AnnouncementFormProps) {
  const { mutate: createAnnouncement, isPending } =
    useCreateAnnouncement(eventId);

  const form = useForm<AnnouncementFormValues>({
    // Zod 유효성 검사 연결
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // 공지 작성 제출
  function handleSubmit(values: AnnouncementFormValues) {
    createAnnouncement(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                <Input placeholder="공지 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 내용 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                내용 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="공지 내용을 입력하세요"
                  className="resize-none"
                  rows={8}
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
            {isPending ? "저장 중..." : "작성하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
