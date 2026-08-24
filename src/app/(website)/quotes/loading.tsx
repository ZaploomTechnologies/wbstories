import { Skeleton } from "@/components/ui/skeleton";
import { QuoteGridSkeleton } from "@/components/shared/skeletons/QuoteGridSkeleton";

export default function QuotesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-2/3 max-w-md" />
      <div className="mt-10">
        <QuoteGridSkeleton count={9} />
      </div>
    </div>
  );
}
