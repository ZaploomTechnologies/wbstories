import { connectToDatabase } from "@/db/connect";
import { StoryLikeModel } from "@/models/story-like.model";
import { MAX_LIKES_PER_CLIENT } from "@/constants/like.constants";
import type { LeanStoryLike } from "@/interfaces/story-like.interface";

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

/**
 * Increments this (storyId, clientId) pair's like count by `delta`, clamped to
 * whatever room remains under MAX_LIKES_PER_CLIENT. Uses a read-then-CAS
 * (compare-and-swap on the previously read `count`) loop so a concurrent
 * update for the same pair can never be silently overwritten — the write
 * only succeeds if `count` still matches what we just read; otherwise we
 * retry with a fresh read. On the very first like for a pair, the doc is
 * upserted; a duplicate-key race there just means another request won the
 * insert first, so we retry and take the normal CAS path against their doc.
 */
async function incrementByDelta(
  storyId: string,
  clientId: string,
  delta: number,
): Promise<{ storyLike: LeanStoryLike; appliedDelta: number }> {
  await connectToDatabase();

  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await StoryLikeModel.findOne({ storyId, clientId }).lean<LeanStoryLike | null>();
    const oldCount = existing?.count ?? 0;
    const appliedDelta = Math.max(0, Math.min(delta, MAX_LIKES_PER_CLIENT - oldCount));

    if (appliedDelta === 0) {
      // Only reachable with no existing doc if delta <= 0 were requested, which validation
      // already rejects (min 1) — existing is effectively guaranteed here.
      return {
        storyLike: existing ?? ({ storyId, clientId, count: 0 } as unknown as LeanStoryLike),
        appliedDelta: 0,
      };
    }

    if (!existing) {
      try {
        const created = await StoryLikeModel.findOneAndUpdate(
          { storyId, clientId },
          { $setOnInsert: { storyId, clientId }, $inc: { count: appliedDelta } },
          { upsert: true, new: true },
        ).lean<LeanStoryLike>();
        return { storyLike: created, appliedDelta };
      } catch (error) {
        if (isDuplicateKeyError(error)) continue;
        throw error;
      }
    }

    const updated = await StoryLikeModel.findOneAndUpdate(
      { _id: existing._id, count: oldCount },
      { $inc: { count: appliedDelta } },
      { new: true },
    ).lean<LeanStoryLike | null>();

    if (updated) {
      return { storyLike: updated, appliedDelta };
    }
    // CAS conflict — someone else updated this pair between our read and write; retry.
  }

  throw new Error("Could not apply like delta after retries");
}

async function findByStoryAndClient(storyId: string, clientId: string) {
  await connectToDatabase();
  return StoryLikeModel.findOne({ storyId, clientId }).lean<LeanStoryLike | null>();
}

export const StoryLikeRepository = {
  incrementByDelta,
  findByStoryAndClient,
};
