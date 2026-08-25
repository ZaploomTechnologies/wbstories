"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StoryGrid } from "@/components/website/StoryGrid";
import { Loader2 } from "lucide-react";
import type { StorySummaryDTO } from "@/types/story.types";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";

interface StoryGridWithInfiniteScrollProps {
  initialItems: StorySummaryDTO[];
  initialMeta: PaginationMeta;
}

export function StoryGridWithInfiniteScroll({
  initialItems,
  initialMeta,
}: StoryGridWithInfiniteScrollProps) {
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = meta.page < meta.totalPages;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, meta.page, isLoading]);

  async function loadMore() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextPage = meta.page + 1;
      const res = await fetch(
        `/api/stories?page=${nextPage}&limit=${meta.limit}&sortBy=publishedAt&order=desc`,
      );
      const json: ApiResponse<StorySummaryDTO[]> = await res.json();

      if (!res.ok || !json.success || !json.meta) {
        throw new Error(json.message || "Failed to load more stories");
      }

      setItems((prev) => [...prev, ...json.data]);
      setMeta(json.meta);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load more stories");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <StoryGrid stories={items} />
      {hasMore && (
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          {isLoading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}
