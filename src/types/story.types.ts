import type { IBannerImage, IBannerVideo, StoryStatus } from "@/interfaces/story.interface";

export interface StoryDTO {
  id: string;
  title: string;
  slug: string;
  bannerImage?: IBannerImage;
  bannerVideo?: IBannerVideo;
  content: string;
  status: StoryStatus;
  publishedAt: string | null;
  readingTime: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

/** List/card views never need the full HTML body. */
export type StorySummaryDTO = Omit<StoryDTO, "content">;

export interface AdjacentStoryDTO {
  title: string;
  slug: string;
  bannerImage?: IBannerImage;
  publishedAt: string | null;
  readingTime: number;
}
