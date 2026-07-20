import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/db/connect";
import { StoryModel } from "@/models/story.model";
import type { IStory, LeanStory, LeanStorySummary } from "@/interfaces/story.interface";

// Excludes `content` — list/card views never need the full HTML body.
const SUMMARY_PROJECTION =
  "title slug bannerImage bannerVideo status publishedAt readingTime likesCount createdAt updatedAt";

export interface ListStoriesParams {
  filter: QueryFilter<IStory>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

async function listSummaries({ filter, sort, skip, limit }: ListStoriesParams) {
  await connectToDatabase();
  return StoryModel.find(filter)
    .select(SUMMARY_PROJECTION)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean<LeanStorySummary[]>();
}

async function count(filter: QueryFilter<IStory>) {
  await connectToDatabase();
  return StoryModel.countDocuments(filter);
}

async function create(data: Partial<IStory>) {
  await connectToDatabase();
  const doc = await StoryModel.create(data);
  return doc.toObject() as LeanStory;
}

async function findById(id: string) {
  await connectToDatabase();
  return StoryModel.findOne({ _id: id, isDeleted: false }).lean<LeanStory | null>();
}

async function findPublishedBySlug(slug: string) {
  await connectToDatabase();
  return StoryModel.findOne({
    slug,
    status: "published",
    isDeleted: false,
  }).lean<LeanStory | null>();
}

async function existsBySlug(slug: string, excludeId?: string) {
  await connectToDatabase();
  const filter: QueryFilter<IStory> = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
  return Boolean(await StoryModel.exists(filter));
}

async function updateById(id: string, data: Partial<IStory>) {
  await connectToDatabase();
  return StoryModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
  }).lean<LeanStory | null>();
}

async function softDeleteById(id: string) {
  await connectToDatabase();
  return StoryModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  ).lean<LeanStory | null>();
}

async function incrementLikesCount(id: string, delta: number) {
  await connectToDatabase();
  return StoryModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $inc: { likesCount: delta } },
    { new: true },
  ).lean<LeanStory | null>();
}

async function findLatest(limit: number) {
  await connectToDatabase();
  return StoryModel.find({ status: "published", isDeleted: false })
    .select(SUMMARY_PROJECTION)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean<LeanStorySummary[]>();
}

async function findRelated(excludeId: string, limit: number) {
  await connectToDatabase();
  return StoryModel.find({
    _id: { $ne: excludeId },
    status: "published",
    isDeleted: false,
  })
    .select(SUMMARY_PROJECTION)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean<LeanStorySummary[]>();
}

const ADJACENT_PROJECTION = "title slug bannerImage publishedAt readingTime";

async function findPreviousPublished(publishedAt: Date) {
  await connectToDatabase();
  return StoryModel.findOne({
    status: "published",
    isDeleted: false,
    publishedAt: { $lt: publishedAt },
  })
    .select(ADJACENT_PROJECTION)
    .sort({ publishedAt: -1 })
    .lean<Pick<LeanStory, "title" | "slug" | "bannerImage" | "publishedAt" | "readingTime"> | null>();
}

async function findNextPublished(publishedAt: Date) {
  await connectToDatabase();
  return StoryModel.findOne({
    status: "published",
    isDeleted: false,
    publishedAt: { $gt: publishedAt },
  })
    .select(ADJACENT_PROJECTION)
    .sort({ publishedAt: 1 })
    .lean<Pick<LeanStory, "title" | "slug" | "bannerImage" | "publishedAt" | "readingTime"> | null>();
}

async function findAllSlugsForSitemap() {
  await connectToDatabase();
  return StoryModel.find({ status: "published", isDeleted: false })
    .select("slug updatedAt")
    .lean<Array<Pick<LeanStory, "slug" | "updatedAt">>>();
}

export const StoryRepository = {
  listSummaries,
  count,
  create,
  findById,
  findPublishedBySlug,
  existsBySlug,
  updateById,
  softDeleteById,
  incrementLikesCount,
  findLatest,
  findRelated,
  findPreviousPublished,
  findNextPublished,
  findAllSlugsForSitemap,
};
