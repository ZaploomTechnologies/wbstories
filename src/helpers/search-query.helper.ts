import type { QueryFilter } from "mongoose";
import type { IStory } from "@/interfaces/story.interface";
import type { IQuote } from "@/interfaces/quote.interface";

export function buildStorySearchFilter(query?: string | null): QueryFilter<IStory> {
  if (!query || !query.trim()) {
    return {};
  }
  return { $text: { $search: query.trim() } };
}

export function buildQuoteSearchFilter(query?: string | null): QueryFilter<IQuote> {
  if (!query || !query.trim()) {
    return {};
  }
  return { $text: { $search: query.trim() } };
}
