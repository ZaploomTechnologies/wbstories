import mongoose, { Schema } from "mongoose";
import type { IQuote } from "@/interfaces/quote.interface";

const QuoteSchema = new Schema<IQuote>(
  {
    image: {
      type: new Schema(
        {
          url: { type: String, required: true },
          publicId: { type: String },
        },
        { _id: false },
      ),
      required: true,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

QuoteSchema.index({ status: 1, publishedAt: -1 });
QuoteSchema.index({ isDeleted: 1 });
QuoteSchema.index({ quote: "text", description: "text" }, { name: "quote_text_search" });

export const QuoteModel =
  (mongoose.models.Quote as mongoose.Model<IQuote>) ??
  mongoose.model<IQuote>("Quote", QuoteSchema);
