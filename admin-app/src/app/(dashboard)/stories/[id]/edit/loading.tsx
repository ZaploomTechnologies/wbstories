import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/components/shared/skeletons/FormSkeleton";

export default function EditStoryLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <FormSkeleton />
    </div>
  );
}
