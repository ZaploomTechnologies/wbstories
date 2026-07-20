import { StoryRepository } from "@/repositories/story.repository";
import { StoryLikeRepository } from "@/repositories/story-like.repository";
import { ApiError } from "@/helpers/api-error";
import { MAX_LIKES_PER_CLIENT } from "@/constants/like.constants";
import type { LikeStatusDTO } from "@/types/story-like.types";

export const StoryLikeService = {
  async likeStory(slug: string, clientId: string, delta: number): Promise<LikeStatusDTO> {
    const story = await StoryRepository.findPublishedBySlug(slug);
    if (!story) {
      throw ApiError.notFound("Story not found");
    }

    const { storyLike, appliedDelta } = await StoryLikeRepository.incrementByDelta(
      story._id.toString(),
      clientId,
      delta,
    );

    let totalLikes = story.likesCount ?? 0;
    if (appliedDelta > 0) {
      const updatedStory = await StoryRepository.incrementLikesCount(story._id.toString(), appliedDelta);
      totalLikes = updatedStory?.likesCount ?? totalLikes + appliedDelta;
    }

    return {
      totalLikes,
      clientLikeCount: storyLike.count,
      capped: storyLike.count >= MAX_LIKES_PER_CLIENT,
      incremented: appliedDelta > 0,
    };
  },

  async getLikeStatus(slug: string, clientId: string): Promise<LikeStatusDTO> {
    const story = await StoryRepository.findPublishedBySlug(slug);
    if (!story) {
      throw ApiError.notFound("Story not found");
    }

    const like = await StoryLikeRepository.findByStoryAndClient(story._id.toString(), clientId);
    const clientLikeCount = like?.count ?? 0;

    return {
      totalLikes: story.likesCount ?? 0,
      clientLikeCount,
      capped: clientLikeCount >= MAX_LIKES_PER_CLIENT,
    };
  },
};
