import type { NextRequest } from "next/server";
import { StoryLikeService } from "@/services/story-like.service";
import { ResponseBuilder } from "@/helpers/api-response";
import { parseJsonBody } from "@/helpers/request-body.helper";
import { likeStoryBodySchema, likeStatusQuerySchema } from "@/validations/story-like.validation";

export const StoryLikeController = {
  /** POST /api/stories/[slug]/like */
  async like(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    const body = await parseJsonBody(req);
    const { clientId, delta } = likeStoryBodySchema.parse(body);
    const result = await StoryLikeService.likeStory(slug, clientId, delta);
    return ResponseBuilder.success(result, "Story liked");
  },

  /** GET /api/stories/[slug]/like?clientId=... */
  async getStatus(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    const { clientId } = likeStatusQuerySchema.parse({
      clientId: req.nextUrl.searchParams.get("clientId") ?? "",
    });
    const result = await StoryLikeService.getLikeStatus(slug, clientId);
    return ResponseBuilder.success(result, "Like status fetched");
  },
};
