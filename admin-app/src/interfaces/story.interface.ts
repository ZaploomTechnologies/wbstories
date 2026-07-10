// Trimmed for the admin app: only the DTO-relevant shapes the UI needs.
// The main app's version also extends mongoose's Document for the schema —
// this app has no DB access, so that half doesn't apply here.
export type StoryStatus = "draft" | "published";

export interface IBannerImage {
  url: string;
  publicId?: string;
}

export interface IBannerVideo {
  embedHtml: string;
}
