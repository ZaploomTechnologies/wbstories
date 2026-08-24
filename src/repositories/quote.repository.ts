import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/db/connect";
import { QuoteModel } from "@/models/quote.model";
import type { IQuote, LeanQuote } from "@/interfaces/quote.interface";

export interface ListQuotesParams {
  filter: QueryFilter<IQuote>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}

async function list({ filter, sort, skip, limit }: ListQuotesParams) {
  await connectToDatabase();
  return QuoteModel.find(filter).sort(sort).skip(skip).limit(limit).lean<LeanQuote[]>();
}

async function count(filter: QueryFilter<IQuote>) {
  await connectToDatabase();
  return QuoteModel.countDocuments(filter);
}

async function create(data: Partial<IQuote>) {
  await connectToDatabase();
  const doc = await QuoteModel.create(data);
  return doc.toObject() as LeanQuote;
}

async function findById(id: string) {
  await connectToDatabase();
  return QuoteModel.findOne({ _id: id, isDeleted: false }).lean<LeanQuote | null>();
}

async function updateById(id: string, data: Partial<IQuote>) {
  await connectToDatabase();
  return QuoteModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
  }).lean<LeanQuote | null>();
}

async function softDeleteById(id: string) {
  await connectToDatabase();
  return QuoteModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  ).lean<LeanQuote | null>();
}

export const QuoteRepository = {
  list,
  count,
  create,
  findById,
  updateById,
  softDeleteById,
};
