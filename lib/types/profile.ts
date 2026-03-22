// 프로필 관련 UI 타입 정의

import type { EventListItem } from "./event";

export type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type PaginatedEvents = {
  data: EventListItem[];
  total: number;
  page: number;
  pageSize: number;
};
