import { QuoteRepository } from "@/repositories/quote.repository";
import { ApiError } from "@/helpers/api-error";
import { buildQuoteSearchFilter } from "@/helpers/search-query.helper";
import { buildSortStage, type SortOrder } from "@/helpers/sort-query.helper";
import { resolvePagination, buildPaginationMeta } from "@/helpers/pagination.helper";
import { toISODate } from "@/helpers/date.helper";
import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  AdminQuoteListQuery,
} from "@/validations/quote.validation";
import type { QuoteDTO } from "@/types/quote.types";
import type { PaginatedResult } from "@/types/api.types";
import type { IQuote, LeanQuote } from "@/interfaces/quote.interface";

function toQuoteDTO(doc: LeanQuote): QuoteDTO {
  return {
    id: doc._id.toString(),
    image: doc.image,
    quote: doc.quote,
    description: doc.description,
    status: doc.status,
    publishedAt: doc.publishedAt ? toISODate(doc.publishedAt) : null,
    createdAt: toISODate(doc.createdAt),
    updatedAt: toISODate(doc.updatedAt),
  };
}

interface PublicListParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  order?: SortOrder;
}

export const QuoteService = {
  async createQuote(input: CreateQuoteInput): Promise<QuoteDTO> {
    const publishedAt = input.status === "published" ? new Date() : null;

    const created = await QuoteRepository.create({
      image: input.image,
      quote: input.quote,
      description: input.description,
      status: input.status,
      publishedAt,
    });

    return toQuoteDTO(created);
  },

  async updateQuote(id: string, input: UpdateQuoteInput): Promise<QuoteDTO> {
    const existing = await QuoteRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Quote not found");
    }

    const updates: Partial<IQuote> = { ...input };

    if (input.status === "published" && existing.status !== "published") {
      updates.publishedAt = new Date();
    } else if (input.status === "draft") {
      updates.publishedAt = null;
    }

    const updated = await QuoteRepository.updateById(id, updates);
    if (!updated) {
      throw ApiError.notFound("Quote not found");
    }

    return toQuoteDTO(updated);
  },

  async deleteQuote(id: string): Promise<void> {
    const deleted = await QuoteRepository.softDeleteById(id);
    if (!deleted) {
      throw ApiError.notFound("Quote not found");
    }
  },

  async getByIdForAdmin(id: string): Promise<QuoteDTO> {
    const doc = await QuoteRepository.findById(id);
    if (!doc) {
      throw ApiError.notFound("Quote not found");
    }
    return toQuoteDTO(doc);
  },

  async listPublicQuotes(params: PublicListParams): Promise<PaginatedResult<QuoteDTO>> {
    const { page, limit, skip } = resolvePagination(params);
    const filter = {
      ...buildQuoteSearchFilter(params.q),
      status: "published" as const,
      isDeleted: false,
    };
    const sort = buildSortStage(params.sortBy, params.order);

    const [docs, total] = await Promise.all([
      QuoteRepository.list({ filter, sort, skip, limit }),
      QuoteRepository.count(filter),
    ]);

    return {
      items: docs.map(toQuoteDTO),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async listAdminQuotes(query: AdminQuoteListQuery): Promise<PaginatedResult<QuoteDTO>> {
    const { page, limit, skip } = resolvePagination(query);
    const filter = {
      ...buildQuoteSearchFilter(query.q),
      ...(query.status !== "all" ? { status: query.status } : {}),
      isDeleted: false,
    };
    const sort = buildSortStage(query.sortBy, query.order);

    const [docs, total] = await Promise.all([
      QuoteRepository.list({ filter, sort, skip, limit }),
      QuoteRepository.count(filter),
    ]);

    return {
      items: docs.map(toQuoteDTO),
      meta: buildPaginationMeta(total, page, limit),
    };
  },
};
