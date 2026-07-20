import { StoryService } from "@/services/story.service";
import { StoryGrid } from "@/components/website/StoryGrid";
import { StoryPagination } from "@/components/website/StoryPagination";
import { HomeHero } from "@/components/website/HomeHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { VisitCounterChip } from "@/components/shared/VisitCounterChip";
import { siteConfig } from "@/config/site.config";
import { buildMetadata } from "@/helpers/metadata.helper";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata = buildMetadata({
  title: siteConfig.tagline,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const latest = await StoryService.listPublicStories({
    page,
    limit: 9,
    sortBy: "publishedAt",
    order: "desc",
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
        }}
      />
      <HomeHero />
      <VisitCounterChip />
      <div id="latest-stories" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-4 pb-12 sm:pt-6 sm:pb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Business Stories</h2>

        <div className="mt-10">
          <StoryGrid stories={latest.items} />
        </div>
        <div className="mt-10">
          <StoryPagination page={latest.meta.page} totalPages={latest.meta.totalPages} />
        </div>
      </div>
    </>
  );
}
