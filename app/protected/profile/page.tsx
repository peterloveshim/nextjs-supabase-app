import type { Metadata } from "next";

import { ProfileClient } from "./_components/profile-client";
import { fetchProfile } from "./actions";

export const metadata: Metadata = {
  title: "내 프로필",
  description: "프로필 정보를 확인하고 수정합니다.",
};

export default async function ProfilePage() {
  const profile = await fetchProfile();

  return <ProfileClient initialProfile={profile} />;
}
