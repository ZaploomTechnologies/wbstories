import {
  Autoformat,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  BlockQuote,
  Heading,
  Link,
  List,
  Image,
  ImageToolbar,
  ImageResize,
  ImageStyle,
  ImageUpload,
  ImageCaption,
  ImageTextAlternative,
  MediaEmbed,
  HorizontalLine,
  BlockToolbar,
  Essentials,
  Paragraph,
  Undo,
  type EditorConfig,
} from "ckeditor5";
import { BookmarkCardEditing, BookmarkCardAutoEmbed } from "./ckeditor-bookmark-card.plugin";

// Kept as one list so the allowed tags/attributes in
// services/sanitize.service.ts can be reasoned about against exactly this
// set of plugins — widen both together, never independently.
export const CKEDITOR_PLUGINS = [
  Essentials,
  Autoformat,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  BlockQuote,
  Link,
  List,
  Image,
  ImageToolbar,
  ImageResize,
  ImageStyle,
  ImageUpload,
  ImageCaption,
  ImageTextAlternative,
  MediaEmbed,
  HorizontalLine,
  BlockToolbar,
  Undo,
  BookmarkCardEditing,
  BookmarkCardAutoEmbed,
];

// The Medium-style selection/balloon toolbar — appears when text is
// highlighted, for inline formatting only.
export const CKEDITOR_TOOLBAR = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "heading",
  "|",
  "link",
  "blockQuote",
];

// The Medium-style block-insert toolbar — appears via the "+" gutter button
// on empty lines, for inserting non-text content. Deliberately just these
// three: image, link-based embed (video/tweets/etc.), section divider.
export const CKEDITOR_BLOCK_TOOLBAR = ["uploadImage", "mediaEmbed", "horizontalLine"];

// CKEditor's default MediaEmbed provider list is fully replaced (not merged)
// below, rather than using `removeProviders`/`extraProviders` — those two
// options filter the *combined* list by provider name, so overriding
// "twitter" via extraProviders while also removing the default "twitter"
// silently drops both. The youtube/vimeo/dailymotion/spotify entries are
// copied verbatim from CKEditor's own provider list (the only ones with a
// built-in `html()` renderer — see the comment on `previewsInData` below for
// why that matters); instagram/facebook/googleMaps/flickr are simply
// omitted since we haven't given them one either.
//
// Twitter/X needs its own entry: it has no built-in `html()` renderer, so
// without this, pasting a tweet link would only ever save a semantic
// <oembed> placeholder tag (stripped by sanitizeHtml — not an allowed tag).
// This renders Twitter's own minimal blockquote+link embed format instead,
// which their widgets.js (loaded on the public story page) upgrades into the
// full tweet client-side — no inline <script>, so it survives sanitization
// untouched.
const MEDIA_PROVIDERS = [
  {
    name: "youtube",
    url: [
      /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)(?:&t=(\d+))?/,
      /^(?:m\.)?youtube\.com\/shorts\/([\w-]+)(?:\?t=(\d+))?/,
      /^(?:m\.)?youtube\.com\/v\/([\w-]+)(?:\?t=(\d+))?/,
      /^youtube\.com\/embed\/([\w-]+)(?:\?start=(\d+))?/,
      /^youtu\.be\/([\w-]+)(?:\?t=(\d+))?/,
    ],
    html: (match: RegExpMatchArray) => {
      const id = match[1];
      const time = match[2];
      return `<div><iframe src="https://www.youtube.com/embed/${id}${time ? `?start=${time}` : ""}" width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;" frameborder="0" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
    },
  },
  {
    name: "vimeo",
    url: [
      /^vimeo\.com\/(\d+)/,
      /^vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
      /^vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
      /^vimeo\.com\/channels\/[^/]+\/(\d+)/,
      /^vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
      /^vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
      /^player\.vimeo\.com\/video\/(\d+)/,
    ],
    html: (match: RegExpMatchArray) =>
      `<div><iframe src="https://player.vimeo.com/video/${match[1]}" width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`,
  },
  {
    name: "dailymotion",
    url: [/^dailymotion\.com\/video\/(\w+)/, /^dai\.ly\/(\w+)/],
    html: (match: RegExpMatchArray) =>
      `<div><iframe src="https://www.dailymotion.com/embed/video/${match[1]}" width="1280" height="720" style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;" frameborder="0" allowfullscreen allow="autoplay"></iframe></div>`,
  },
  {
    name: "spotify",
    url: [
      /^open\.spotify\.com\/(artist\/\w+)/,
      /^open\.spotify\.com\/(album\/\w+)/,
      /^open\.spotify\.com\/(track\/\w+)/,
    ],
    html: (match: RegExpMatchArray) => {
      const id = match[1];
      const isTrack = id.startsWith("track/");
      return `<div><iframe src="https://open.spotify.com/embed/${id}" width="300" height="${isTrack ? "80" : "378"}" style="${isTrack ? "width: 100%; height: 80px; border: 0; display: block;" : "width: 100%; height: auto; aspect-ratio: 100 / 126; border: 0; display: block;"}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>`;
    },
  },
  {
    name: "twitter",
    url: /^(?:twitter|x)\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/,
    html: (match: RegExpMatchArray) => {
      const [, user, id] = match;
      return `<blockquote class="twitter-tweet"><a href="https://twitter.com/${user}/status/${id}">Tweet by @${user}</a></blockquote>`;
    },
  },
];

export const CKEDITOR_BASE_CONFIG: Partial<EditorConfig> = {
  licenseKey: "GPL",
  placeholder: "Tell your story...",
  toolbar: CKEDITOR_TOOLBAR,
  blockToolbar: CKEDITOR_BLOCK_TOOLBAR,
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
    resizeUnit: "%",
  },
  mediaEmbed: {
    // Without this, saved content only ever gets a semantic <oembed> tag
    // instead of the actual iframe/blockquote markup — see MEDIA_PROVIDERS
    // comment above.
    previewsInData: true,
    providers: MEDIA_PROVIDERS,
  },
};
