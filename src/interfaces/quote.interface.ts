import type { Document, Types } from "mongoose";

export type QuoteStatus = "draft" | "published";

export interface IQuoteImage {
  url: string;
  publicId?: string;
}

export interface IQuote extends Document {
  _id: Types.ObjectId;
  image: IQuoteImage;
  quote: string;
  description: string;
  status: QuoteStatus;
  publishedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape returned by `.lean()` queries — same fields, no Document methods. */
export type LeanQuote = Omit<IQuote, keyof Document> & { _id: Types.ObjectId };
