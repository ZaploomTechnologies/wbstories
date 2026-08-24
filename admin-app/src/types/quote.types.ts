import type { IQuoteImage, QuoteStatus } from "@/interfaces/quote.interface";

export interface QuoteDTO {
  id: string;
  image: IQuoteImage;
  quote: string;
  description: string;
  status: QuoteStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
