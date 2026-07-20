import { z } from "zod";
import { MAX_LIKES_PER_CLIENT } from "@/constants/like.constants";

export const likeStoryBodySchema = z.object({
  clientId: z.string().trim().min(1, "clientId is required").max(100),
  delta: z.coerce.number().int().min(1).max(MAX_LIKES_PER_CLIENT).default(1),
});

export const likeStatusQuerySchema = z.object({
  clientId: z.string().trim().min(1, "clientId is required").max(100),
});

export type LikeStoryInput = z.infer<typeof likeStoryBodySchema>;
