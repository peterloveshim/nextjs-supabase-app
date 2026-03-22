"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { AvatarUpload } from "@/components/profile/avatar-upload";
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
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import type { ProfileData } from "@/lib/types/profile";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";

type ProfileCardProps = {
  initialProfile: ProfileData | null;
};

export function ProfileCard({ initialProfile }: ProfileCardProps) {
  const { data: profile } = useProfile(initialProfile);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      bio: profile?.bio ?? "",
      avatar_url: profile?.avatar_url ?? "",
    },
  });

  // 프로필 데이터가 바뀌면 폼 초기값 갱신
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(values);
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-6 text-base font-semibold">프로필 정보</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* 아바타 업로드 */}
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <AvatarUpload
                  value={field.value}
                  onChange={field.onChange}
                  userId={profile?.id ?? ""}
                  displayName={form.watch("full_name")}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 이메일 (읽기 전용) */}
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input value={profile?.email ?? ""} readOnly disabled />
            </FormControl>
          </FormItem>

          {/* 이름 */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="이름을 입력해주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 소개 */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>소개</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="자신을 소개해주세요 (200자 이하)"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 저장 버튼 */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
