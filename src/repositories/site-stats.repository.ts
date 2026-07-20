import { connectToDatabase } from "@/db/connect";
import { SiteStatsModel } from "@/models/site-stats.model";
import type { LeanSiteStats } from "@/interfaces/site-stats.interface";

const GLOBAL_KEY = "global";

async function incrementVisitCount() {
  await connectToDatabase();
  return SiteStatsModel.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $inc: { visitCount: 1 } },
    { upsert: true, new: true },
  ).lean<LeanSiteStats>();
}

export const SiteStatsRepository = {
  incrementVisitCount,
};
