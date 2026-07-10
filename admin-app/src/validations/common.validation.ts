import { z } from "zod";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants/pagination.constants";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().optional(),
});

export const sortQuerySchema = z.object({
  sortBy: z.string().trim().optional().default("publishedAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SortQuery = z.infer<typeof sortQuerySchema>;
