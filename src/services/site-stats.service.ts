import { SiteStatsRepository } from "@/repositories/site-stats.repository";

export const SiteStatsService = {
  async recordVisit(): Promise<number> {
    const stats = await SiteStatsRepository.incrementVisitCount();
    return stats.visitCount;
  },
};
