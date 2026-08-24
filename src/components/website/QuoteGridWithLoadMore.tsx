"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QuoteGrid } from "@/components/website/QuoteGrid";
import { Button } from "@/components/ui/button";
import type { QuoteDTO } from "@/types/quote.types";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";

interface QuoteGridWithLoadMoreProps {
  initialItems: QuoteDTO[];
  initialMeta: PaginationMeta;
}

export function QuoteGridWithLoadMore({ initialItems, initialMeta }: QuoteGridWithLoadMoreProps) {
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = meta.page < meta.totalPages;

  async function handleLoadMore() {
    setIsLoading(true);
    try {
      const nextPage = meta.page + 1;
      const res = await fetch(
        `/api/quotes?page=${nextPage}&limit=${meta.limit}&sortBy=publishedAt&order=desc`,
      );
      const json: ApiResponse<QuoteDTO[]> = await res.json();

      if (!res.ok || !json.success || !json.meta) {
        throw new Error(json.message || "Failed to load more quotes");
      }

      setItems((prev) => [...prev, ...json.data]);
      setMeta(json.meta);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load more quotes");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <QuoteGrid quotes={items} />
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
