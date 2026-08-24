// Trimmed for the admin app: only the DTO-relevant shapes the UI needs.
export type QuoteStatus = "draft" | "published";

export interface IQuoteImage {
  url: string;
  publicId?: string;
}
