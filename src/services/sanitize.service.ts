import sanitizeHtmlLib from "sanitize-html";

// Tag/attribute allowlist matches the CKEditor 5 toolbar configured in
// lib/ckeditor.config.ts (headings, lists, tables, images, media embed,
// blockquote, code block, hr) — never widen this without widening the editor
// config to match, and vice versa.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "pre",
  "code",
  "iframe",
  "span",
  "div",
];

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "class",
  "target",
  "rel",
  "width",
  "height",
  "colspan",
  "rowspan",
  "frameborder",
  "allow",
  "allowfullscreen",
];

/**
 * Single source of truth for sanitizing CKEditor HTML. Called on write
 * (before persisting) and again on read (defense in depth) — never trust
 * HTML pulled from the database either, in case the allowlist changes later.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  return sanitizeHtmlLib(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ALLOWED_ATTR,
    },
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  });
}
