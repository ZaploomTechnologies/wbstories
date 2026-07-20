import type { Document, Types } from "mongoose";

export interface IStoryLike extends Document {
  _id: Types.ObjectId;
  storyId: Types.ObjectId;
  clientId: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export type LeanStoryLike = Omit<IStoryLike, keyof Document> & { _id: Types.ObjectId };
