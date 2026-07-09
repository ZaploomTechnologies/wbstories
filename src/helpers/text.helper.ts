/** Strips HTML tags and collapses whitespace, for previews/meta descriptions. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncates plain text to `maxLength`, breaking on a word boundary. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}...`;
}

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;
// Matches the `<div><iframe ...>...</iframe></div>` wrapper MediaEmbed's
// provider `html()` templates produce (see MEDIA_PROVIDERS in
// lib/ckeditor.config.ts) — covers youtube/vimeo/dailymotion/spotify alike.
const VIDEO_EMBED_RE = /<div>\s*<iframe\b[^>]*>[\s\S]*?<\/iframe>\s*<\/div>/i;
// Matches a bookmark card's wrapping `<a class="bookmark-card" ...>...</a>`
// (see BookmarkCardEditing in lib/ckeditor-bookmark-card.plugin.ts) — safe to
// bound on the first `</a>` since generated cards never nest another anchor.
const BOOKMARK_CARD_RE = /<a\b[^>]*\bclass=["'][^"']*\bbookmark-card\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi;

/**
 * Removes bookmark-card markup before scanning for banner media, so a card's
 * own thumbnail/favicon `<img>` is never mistaken for the story's banner.
 */
function stripBookmarkCards(html: string): string {
  return html.replace(BOOKMARK_CARD_RE, "");
}

/** First `<img src="...">` found in sanitized story content, used as the auto-derived banner. */
export function firstImageUrl(html: string): string | null {
  const match = stripBookmarkCards(html).match(IMG_SRC_RE);
  return match ? match[1] : null;
}

/** First video embed block found in sanitized story content, used as the auto-derived banner. */
export function firstVideoEmbedHtml(html: string): string | null {
  const match = stripBookmarkCards(html).match(VIDEO_EMBED_RE);
  return match ? match[0] : null;
}

const YOUTUBE_EMBED_SRC_RE = /youtube\.com\/embed\/([\w-]+)/i;

/**
 * Derives a static thumbnail URL from a YouTube embed's iframe src, for use as
 * a share-preview image. Vimeo/Dailymotion/Spotify embeds have no equivalent
 * predictable thumbnail URL, so those (and non-video banners) return null.
 */
export function youtubeThumbnailUrl(embedHtml: string): string | null {
  const match = embedHtml.match(YOUTUBE_EMBED_SRC_RE);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}
