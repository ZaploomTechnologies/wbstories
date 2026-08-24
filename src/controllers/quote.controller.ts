import type { NextRequest } from "next/server";
import { QuoteService } from "@/services/quote.service";
import { ResponseBuilder } from "@/helpers/api-response";
import {
  paginationQuerySchema,
  searchQuerySchema,
  sortQuerySchema,
} from "@/validations/common.validation";

function queryToObject(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

export const QuoteController = {
  /** GET /api/quotes — published quotes only, paginated/searchable/sortable. */
  async list(req: NextRequest) {
    const params = queryToObject(req.nextUrl.searchParams);
    const { page, limit } = paginationQuerySchema.parse(params);
    const { q } = searchQuerySchema.parse(params);
    const { sortBy, order } = sortQuerySchema.parse(params);

    const result = await QuoteService.listPublicQuotes({ page, limit, q, sortBy, order });
    return ResponseBuilder.success(result.items, "Quotes fetched", 200, result.meta);
  },
};
