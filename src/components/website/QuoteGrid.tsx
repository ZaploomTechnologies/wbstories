import { QuoteCard } from "@/components/website/QuoteCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { QuoteDTO } from "@/types/quote.types";

interface QuoteGridProps {
  quotes: QuoteDTO[];
}

export function QuoteGrid({ quotes }: QuoteGridProps) {
  if (quotes.length === 0) {
    return (
      <EmptyState
        title="No quotes found"
        description="Check back soon for new quotes."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  );
}
