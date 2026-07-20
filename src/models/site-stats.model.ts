import mongoose, { Schema } from "mongoose";
import type { ISiteStats } from "@/interfaces/site-stats.interface";

const SiteStatsSchema = new Schema<ISiteStats>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    visitCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export const SiteStatsModel =
  (mongoose.models.SiteStats as mongoose.Model<ISiteStats>) ??
  mongoose.model<ISiteStats>("SiteStats", SiteStatsSchema);
