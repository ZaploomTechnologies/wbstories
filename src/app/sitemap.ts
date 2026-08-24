import type { MetadataRoute } from "next";
import { StoryRepository } from "@/repositories/story.repository";
import { siteConfig } from "@/config/site.config";

// Generated per-request rather than frozen at build time — stories are
// published independently of deploys, and a stale sitemap would miss them
// until the next deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await StoryRepository.findAllSlugsForSitemap();

  const storyEntries: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${siteConfig.url}/stories/${story.slug}`,
    lastModified: story.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/quotes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  return [...staticEntries, ...storyEntries];
}
