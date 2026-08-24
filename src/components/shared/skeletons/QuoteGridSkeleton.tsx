import { QuoteCardSkeleton } from "@/components/shared/skeletons/QuoteCardSkeleton";

export function QuoteGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <QuoteCardSkeleton key={index} />
      ))}
    </div>
  );
}
