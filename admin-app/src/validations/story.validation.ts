import { z } from "zod";
import { paginationQuerySchema, searchQuerySchema, sortQuerySchema } from "@/validations/common.validation";

export const createStorySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(1, "Story content is required"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateStorySchema = createStorySchema.partial();

export const adminStoryListQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .merge(sortQuerySchema)
  .extend({
    status: z.enum(["draft", "published", "all"]).optional().default("all"),
  });

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type AdminStoryListQuery = z.infer<typeof adminStoryListQuerySchema>;
