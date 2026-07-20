import { asyncHandler } from "@/helpers/async-handler";
import { SiteStatsController } from "@/controllers/site-stats.controller";

export const POST = asyncHandler(SiteStatsController.recordVisit);
