import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full max-w-md" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-10 w-48" />
    </div>
  );
}
