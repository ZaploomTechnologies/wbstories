import { StoryRepository } from "@/repositories/story.repository";
import { generateUniqueSlug } from "@/services/slug.service";
import { sanitizeHtml } from "@/services/sanitize.service";
import { calculateReadingTime } from "@/services/reading-time.service";
import { firstImageUrl, firstVideoEmbedHtml } from "@/helpers/text.helper";
import { ApiError } from "@/helpers/api-error";
import { buildStorySearchFilter } from "@/helpers/search-query.helper";
import { buildSortStage, type SortOrder } from "@/helpers/sort-query.helper";
import { resolvePagination, buildPaginationMeta } from "@/helpers/pagination.helper";
import { toISODate } from "@/helpers/date.helper";
import type {
  CreateStoryInput,
  UpdateStoryInput,
  AdminStoryListQuery,
} from "@/validations/story.validation";
import type { StoryDTO, StorySummaryDTO, AdjacentStoryDTO } from "@/types/story.types";
import type { PaginatedResult } from "@/types/api.types";
import type { IStory, LeanStory, LeanStorySummary } from "@/interfaces/story.interface";

function toStoryDTO(doc: LeanStory): StoryDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    bannerImage: doc.bannerImage,
    bannerVideo: doc.bannerVideo,
    content: doc.content,
    status: doc.status,
    publishedAt: doc.publishedAt ? toISODate(doc.publishedAt) : null,
    readingTime: doc.readingTime,
    likesCount: doc.likesCount ?? 0,
    createdAt: toISODate(doc.createdAt),
    updatedAt: toISODate(doc.updatedAt),
  };
}

function toStorySummaryDTO(doc: LeanStorySummary): StorySummaryDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    bannerImage: doc.bannerImage,
    bannerVideo: doc.bannerVideo,
    status: doc.status,
    publishedAt: doc.publishedAt ? toISODate(doc.publishedAt) : null,
    readingTime: doc.readingTime,
    likesCount: doc.likesCount ?? 0,
    createdAt: toISODate(doc.createdAt),
    updatedAt: toISODate(doc.updatedAt),
  };
}

function toAdjacentStoryDTO(
  doc: Pick<LeanStory, "title" | "slug" | "bannerImage" | "publishedAt" | "readingTime">,
): AdjacentStoryDTO {
  return {
    title: doc.title,
    slug: doc.slug,
    bannerImage: doc.bannerImage,
    publishedAt: doc.publishedAt ? toISODate(doc.publishedAt) : null,
    readingTime: doc.readingTime,
  };
}

interface PublicListParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  order?: SortOrder;
}

export const StoryService = {
  async createStory(input: CreateStoryInput): Promise<StoryDTO> {
    const slug = await generateUniqueSlug(input.title);
    const content = sanitizeHtml(input.content);
    const readingTime = calculateReadingTime(content);
    const publishedAt = input.status === "published" ? new Date() : null;
    const imageUrl = firstImageUrl(content);
    const videoEmbedHtml = firstVideoEmbedHtml(content);

    const created = await StoryRepository.create({
      title: input.title,
      bannerImage: imageUrl ? { url: imageUrl } : undefined,
      bannerVideo: videoEmbedHtml ? { embedHtml: videoEmbedHtml } : undefined,
      status: input.status,
      slug,
      content,
      readingTime,
      publishedAt,
    });

    return toStoryDTO(created);
  },

  async updateStory(id: string, input: UpdateStoryInput): Promise<StoryDTO> {
    const existing = await StoryRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Story not found");
    }

    const updates: Partial<IStory> = { ...input };

    // Only churn the slug (and any shared links) when the title actually changed.
    if (input.title && input.title !== existing.title) {
      updates.slug = await generateUniqueSlug(input.title, id);
    }

    if (input.content) {
      const cleanContent = sanitizeHtml(input.content);
      const imageUrl = firstImageUrl(cleanContent);
      const videoEmbedHtml = firstVideoEmbedHtml(cleanContent);
      updates.content = cleanContent;
      updates.readingTime = calculateReadingTime(cleanContent);
      // Left unset (rather than cleared) when the content no longer has an
      // image/video — Mongo drops `undefined` values, so a stale banner from
      // removed media can briefly linger until the next edit adds new media.
      if (imageUrl) {
        updates.bannerImage = { url: imageUrl };
      }
      if (videoEmbedHtml) {
        updates.bannerVideo = { embedHtml: videoEmbedHtml };
      }
    }

    if (input.status === "published" && existing.status !== "published") {
      updates.publishedAt = new Date();
    } else if (input.status === "draft") {
      updates.publishedAt = null;
    }

    const updated = await StoryRepository.updateById(id, updates);
    if (!updated) {
      throw ApiError.notFound("Story not found");
    }

    return toStoryDTO(updated);
  },

  async deleteStory(id: string): Promise<void> {
    const deleted = await StoryRepository.softDeleteById(id);
    if (!deleted) {
      throw ApiError.notFound("Story not found");
    }
  },

  async getPublishedBySlug(slug: string): Promise<StoryDTO | null> {
    const doc = await StoryRepository.findPublishedBySlug(slug);
    return doc ? toStoryDTO(doc) : null;
  },

  async getByIdForAdmin(id: string): Promise<StoryDTO> {
    const doc = await StoryRepository.findById(id);
    if (!doc) {
      throw ApiError.notFound("Story not found");
    }
    return toStoryDTO(doc);
  },

  async listPublicStories(params: PublicListParams): Promise<PaginatedResult<StorySummaryDTO>> {
    const { page, limit, skip } = resolvePagination(params);
    const filter = {
      ...buildStorySearchFilter(params.q),
      status: "published" as const,
      isDeleted: false,
    };
    const sort = buildSortStage(params.sortBy, params.order);

    const [docs, total] = await Promise.all([
      StoryRepository.listSummaries({ filter, sort, skip, limit }),
      StoryRepository.count(filter),
    ]);

    return {
      items: docs.map(toStorySummaryDTO),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async listAdminStories(query: AdminStoryListQuery): Promise<PaginatedResult<StorySummaryDTO>> {
    const { page, limit, skip } = resolvePagination(query);
    const filter = {
      ...buildStorySearchFilter(query.q),
      ...(query.status !== "all" ? { status: query.status } : {}),
      isDeleted: false,
    };
    const sort = buildSortStage(query.sortBy, query.order);

    const [docs, total] = await Promise.all([
      StoryRepository.listSummaries({ filter, sort, skip, limit }),
      StoryRepository.count(filter),
    ]);

    return {
      items: docs.map(toStorySummaryDTO),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getLatest(limit = 6): Promise<StorySummaryDTO[]> {
    const docs = await StoryRepository.findLatest(limit);
    return docs.map(toStorySummaryDTO);
  },

  async getRelated(storyId: string, limit = 4): Promise<StorySummaryDTO[]> {
    const docs = await StoryRepository.findRelated(storyId, limit);
    return docs.map(toStorySummaryDTO);
  },

  async getAdjacent(
    publishedAt: string | null,
  ): Promise<{ previous: AdjacentStoryDTO | null; next: AdjacentStoryDTO | null }> {
    if (!publishedAt) {
      return { previous: null, next: null };
    }

    const date = new Date(publishedAt);
    const [previous, next] = await Promise.all([
      StoryRepository.findPreviousPublished(date),
      StoryRepository.findNextPublished(date),
    ]);

    return {
      previous: previous ? toAdjacentStoryDTO(previous) : null,
      next: next ? toAdjacentStoryDTO(next) : null,
    };
  },
};
