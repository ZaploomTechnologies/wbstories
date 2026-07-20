import type { Document } from "mongoose";

export interface ISiteStats extends Document {
  key: string;
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type LeanSiteStats = Omit<ISiteStats, keyof Document>;
