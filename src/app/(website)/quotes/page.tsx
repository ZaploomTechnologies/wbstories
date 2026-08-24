import { QuoteService } from "@/services/quote.service";
import { QuoteGridWithLoadMore } from "@/components/website/QuoteGridWithLoadMore";
import { QuotesHero } from "@/components/website/QuotesHero";
import { JsonLd } from "@/components/shared/JsonLd";
import { siteConfig } from "@/config/site.config";
import { buildMetadata } from "@/helpers/metadata.helper";

export const metadata = buildMetadata({
  title: "Quotes",
  description: "Inspiring business quotes to download, share, and keep close.",
  path: "/quotes",
});

export default async function QuotesPage() {
  const quotes = await QuoteService.listPublicQuotes({
    page: 1,
    limit: 6,
    sortBy: "publishedAt",
    order: "desc",
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Quotes",
          url: `${siteConfig.url}/quotes`,
        }}
      />

      <QuotesHero />

      <div id="latest-quotes" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-4 pb-12 sm:pt-6 sm:pb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quotes</h2>
        <p className="mt-2 text-muted-foreground">
          Inspiring business quotes — download, share, or copy the link to your favorites.
        </p>

        <div className="mt-10">
          <QuoteGridWithLoadMore initialItems={quotes.items} initialMeta={quotes.meta} />
        </div>
      </div>
    </>
  );
}
