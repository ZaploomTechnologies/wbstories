import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

interface BuildMetadataParams {
  title: string;
  description: string;
  path: string;
  /** Omit to fall back to the site default image; pass `null` to show no image at all. */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/** Shared canonical/OG/Twitter-card shape — every public page builds its Metadata through this. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataParams): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image === null ? undefined : (image ?? `${siteConfig.url}${siteConfig.ogImage}`);
  const images = ogImage ? [{ url: ogImage }] : undefined;

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title,
          description,
          url,
          siteName: siteConfig.name,
          images,
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
        }
      : {
          type: "website",
          title,
          description,
          url,
          siteName: siteConfig.name,
          images,
        };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
