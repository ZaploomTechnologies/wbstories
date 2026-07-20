import { asyncHandler } from "@/helpers/async-handler";
import { StoryLikeController } from "@/controllers/story-like.controller";

export const POST = asyncHandler(StoryLikeController.like);
export const GET = asyncHandler(StoryLikeController.getStatus);
