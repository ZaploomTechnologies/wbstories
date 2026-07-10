"use client";

import useSWR from "swr";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { StorySummaryDTO } from "@/types/story.types";

interface UseAdminStoriesParams {
  page: number;
  limit: number;
  q?: string;
  status?: "draft" | "published" | "all";
  sortBy?: string;
  order?: "asc" | "desc";
}

async function fetcher(url: string): Promise<PaginatedResult<StorySummaryDTO>> {
  const res = await fetch(url);
  const json: ApiResponse<StorySummaryDTO[]> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load stories");
  }

  return { items: json.data, meta: json.meta! };
}

function buildQueryString(params: UseAdminStoriesParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.status) searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);
  return searchParams.toString();
}

export function useAdminStories(params: UseAdminStoriesParams) {
  const queryString = buildQueryString(params);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/stories?${queryString}`,
    fetcher,
    { keepPreviousData: true },
  );

  return {
    stories: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error: error as Error | undefined,
    refresh: mutate,
  };
}
