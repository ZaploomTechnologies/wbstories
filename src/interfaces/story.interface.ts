import type { Document, Types } from "mongoose";

export type StoryStatus = "draft" | "published";

export interface IBannerImage {
  url: string;
  publicId?: string;
}

export interface IBannerVideo {
  embedHtml: string;
}

export interface IStory extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  bannerImage?: IBannerImage;
  bannerVideo?: IBannerVideo;
  content: string;
  status: StoryStatus;
  publishedAt: Date | null;
  readingTime: number;
  isDeleted: boolean;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape returned by `.lean()` queries — same fields, no Document methods. */
export type LeanStory = Omit<IStory, keyof Document> & { _id: Types.ObjectId };

/** List/card projections never select `content` — kept out of the payload entirely. */
export type LeanStorySummary = Omit<LeanStory, "content">;
