import { z } from "zod";
import { paginationQuerySchema, searchQuerySchema, sortQuerySchema } from "@/validations/common.validation";

const quoteImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  publicId: z.string().optional(),
});

export const createQuoteSchema = z.object({
  // Defaulted (rather than plain-required) purely so react-hook-form can seed
  // an empty form with no image selected yet — the inner min(1) still fails
  // validation on submit until a real upload replaces this placeholder.
  image: quoteImageSchema.default({ url: "" }),
  quote: z.string().trim().min(1, "Quote text is required").max(1000),
  description: z.string().trim().min(1, "Description is required").max(500),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const adminQuoteListQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .merge(sortQuerySchema)
  .extend({
    status: z.enum(["draft", "published", "all"]).optional().default("all"),
  });

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type AdminQuoteListQuery = z.infer<typeof adminQuoteListQuerySchema>;
