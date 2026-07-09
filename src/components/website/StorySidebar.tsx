import { StorySidebarCard } from "@/components/website/StorySidebarCard";
import type { AdjacentStoryDTO, StorySummaryDTO } from "@/types/story.types";

interface StorySidebarProps {
  upNext: AdjacentStoryDTO | null;
  related: StorySummaryDTO[];
}

export function StorySidebar({ upNext, related }: StorySidebarProps) {
  if (!upNext && related.length === 0) {
    return null;
  }

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
      {upNext && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-tight">Up next</h2>
          <StorySidebarCard
            slug={upNext.slug}
            title={upNext.title}
            bannerImage={upNext.bannerImage}
            publishedAt={upNext.publishedAt}
            readingTime={upNext.readingTime}
          />
        </section>
      )}

      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-tight">More stories</h2>
          <div className="flex flex-col gap-4">
            {related.map((story) => (
              <StorySidebarCard
                key={story.id}
                slug={story.slug}
                title={story.title}
                bannerImage={story.bannerImage}
                publishedAt={story.publishedAt}
                readingTime={story.readingTime}
              />
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
