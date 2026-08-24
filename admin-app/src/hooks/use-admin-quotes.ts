"use client";

import useSWR from "swr";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { QuoteDTO } from "@/types/quote.types";

interface UseAdminQuotesParams {
  page: number;
  limit: number;
  q?: string;
  status?: "draft" | "published" | "all";
  sortBy?: string;
  order?: "asc" | "desc";
}

async function fetcher(url: string): Promise<PaginatedResult<QuoteDTO>> {
  const res = await fetch(url);
  const json: ApiResponse<QuoteDTO[]> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load quotes");
  }

  return { items: json.data, meta: json.meta! };
}

function buildQueryString(params: UseAdminQuotesParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);
  return searchParams.toString();
}

export function useAdminQuotes(params: UseAdminQuotesParams) {
  const queryString = buildQueryString(params);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/quotes?${queryString}`,
    fetcher,
    { keepPreviousData: true },
  );

  return {
    quotes: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
