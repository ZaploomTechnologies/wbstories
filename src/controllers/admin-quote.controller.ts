import type { NextRequest } from "next/server";
import { QuoteService } from "@/services/quote.service";
import { ResponseBuilder } from "@/helpers/api-response";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import {
  createQuoteSchema,
  updateQuoteSchema,
  adminQuoteListQuerySchema,
} from "@/validations/quote.validation";
import { parseJsonBody } from "@/helpers/request-body.helper";

export const AdminQuoteController = {
  /** GET /api/admin/quotes — all statuses, paginated/search/sort/status-filter. */
  async list(req: NextRequest) {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = adminQuoteListQuerySchema.parse(params);
    const result = await QuoteService.listAdminQuotes(query);
    return ResponseBuilder.success(result.items, "Quotes fetched", HTTP_STATUS.OK, result.meta);
  },

  /** GET /api/admin/quotes/[id] */
  async getById(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const quote = await QuoteService.getByIdForAdmin(id);
    return ResponseBuilder.success(quote, "Quote fetched");
  },

  /** POST /api/admin/quotes */
  async create(req: NextRequest) {
    const body = await parseJsonBody(req);
    const input = createQuoteSchema.parse(body);
    const quote = await QuoteService.createQuote(input);
    return ResponseBuilder.success(quote, "Quote created", HTTP_STATUS.CREATED);
  },

  /** PUT /api/admin/quotes/[id] */
  async update(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const body = await parseJsonBody(req);
    const input = updateQuoteSchema.parse(body);
    const quote = await QuoteService.updateQuote(id, input);
    return ResponseBuilder.success(quote, "Quote updated");
  },

  /** DELETE /api/admin/quotes/[id] */
  async remove(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    await QuoteService.deleteQuote(id);
    return ResponseBuilder.success(null, "Quote deleted");
  },
};
