import type { NextRequest } from "next/server";
import { SiteStatsService } from "@/services/site-stats.service";
import { ResponseBuilder } from "@/helpers/api-response";

export const SiteStatsController = {
  /** POST /api/site-stats/visit */
  async recordVisit(_req: NextRequest) {
    const visitCount = await SiteStatsService.recordVisit();
    return ResponseBuilder.success({ visitCount }, "Visit recorded");
  },
};
