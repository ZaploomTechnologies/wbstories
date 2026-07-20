import mongoose, { Schema } from "mongoose";
import type { IStoryLike } from "@/interfaces/story-like.interface";
import { MAX_LIKES_PER_CLIENT } from "@/constants/like.constants";

const StoryLikeSchema = new Schema<IStoryLike>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: MAX_LIKES_PER_CLIENT,
    },
  },
  { timestamps: true },
);

// One tally row per (story, browser) — this is both the dedupe key and what
// makes the atomic cap-increment in the repository race-safe.
StoryLikeSchema.index({ storyId: 1, clientId: 1 }, { unique: true });

export const StoryLikeModel =
  (mongoose.models.StoryLike as mongoose.Model<IStoryLike>) ??
  mongoose.model<IStoryLike>("StoryLike", StoryLikeSchema);
