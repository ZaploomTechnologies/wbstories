import { Skeleton } from "@/components/ui/skeleton";

export function QuoteCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border p-4 sm:gap-5">
      <Skeleton className="aspect-3/4 w-28 shrink-0 rounded-md sm:w-40" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
