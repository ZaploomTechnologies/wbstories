import {
  ClickObserver,
  ClipboardPipeline,
  Delete,
  MediaEmbedEditing,
  ModelLivePosition,
  ModelLiveRange,
  Plugin,
  Undo,
  Widget,
  toWidget,
  type Editor,
  type ModelElement,
  type ModelPosition,
  type ViewDowncastWriter,
} from "ckeditor5";

const MODEL_NAME = "bookmarkCard";
const LINK_PREVIEW_ENDPOINT = "/api/admin/link-preview";

export interface BookmarkCardAttributes {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  [key: string]: string | undefined;
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function readAttributes(modelElement: ModelElement): BookmarkCardAttributes {
  const get = (name: string) => modelElement.getAttribute(name) as string | undefined;
  return {
    url: get("url") ?? "",
    title: get("title") ?? "",
    description: get("description"),
    image: get("image"),
    siteName: get("siteName"),
    favicon: get("favicon"),
  };
}

/** Builds the `<span>`/`<img>` children shared by both the data and editing view — only the root element (`<a>` vs `<div>`) differs between them. */
function buildCardChildren(attrs: BookmarkCardAttributes, writer: ViewDowncastWriter) {
  const children = [];

  if (attrs.image) {
    children.push(
      writer.createContainerElement("span", { class: "bookmark-card__thumb" }, [
        writer.createEmptyElement("img", { src: attrs.image, alt: "" }),
      ]),
    );
  }

  const metaChildren = [];
  if (attrs.favicon) {
    metaChildren.push(
      writer.createEmptyElement("img", {
        class: "bookmark-card__favicon",
        src: attrs.favicon,
        alt: "",
      }),
    );
  }
  metaChildren.push(writer.createText(attrs.siteName || safeHostname(attrs.url)));

  const bodyChildren = [
    writer.createContainerElement("span", { class: "bookmark-card__title" }, [
      writer.createText(attrs.title || attrs.url),
    ]),
  ];
  if (attrs.description) {
    bodyChildren.push(
      writer.createContainerElement("span", { class: "bookmark-card__desc" }, [
        writer.createText(attrs.description),
      ]),
    );
  }
  bodyChildren.push(writer.createContainerElement("span", { class: "bookmark-card__meta" }, metaChildren));

  children.push(writer.createContainerElement("span", { class: "bookmark-card__body" }, bodyChildren));

  return children;
}

function buildDataAttributes(attrs: BookmarkCardAttributes): Record<string, string> {
  const result: Record<string, string> = {
    href: attrs.url,
    class: "bookmark-card",
    target: "_blank",
    rel: "noopener noreferrer nofollow",
    "data-bookmark-url": attrs.url,
    "data-title": attrs.title,
  };
  if (attrs.description) result["data-description"] = attrs.description;
  if (attrs.image) result["data-image"] = attrs.image;
  if (attrs.siteName) result["data-site-name"] = attrs.siteName;
  if (attrs.favicon) result["data-favicon"] = attrs.favicon;
  return result;
}

/** Schema, converters, and widget wiring for the `bookmarkCard` block object — a rich link-preview card produced from pasting a non-media URL (see BookmarkCardAutoEmbed). */
export class BookmarkCardEditing extends Plugin {
  static get requires() {
    return [Widget] as const;
  }

  static get pluginName() {
    return "BookmarkCardEditing" as const;
  }

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;
    const conversion = editor.conversion;

    schema.register(MODEL_NAME, {
      inheritAllFrom: "$blockObject",
      allowAttributes: ["url", "title", "description", "image", "siteName", "favicon"],
    });

    // Data pipeline (saved/loaded HTML) — a real anchor so the card is a
    // functioning link on the public story page. Must match the tags/attrs
    // allowlisted in services/sanitize.service.ts.
    conversion.for("dataDowncast").elementToElement({
      model: MODEL_NAME,
      view: (modelElement, { writer }) => {
        const attrs = readAttributes(modelElement);
        return writer.createContainerElement(
          "a",
          buildDataAttributes(attrs),
          buildCardChildren(attrs, writer),
        );
      },
    });

    // Editing pipeline — rooted in a <div>, not an <a>, so the browser never
    // tries to navigate the admin page itself on click; opening the link is
    // instead handled explicitly below (in a new tab) via the click listener.
    conversion.for("editingDowncast").elementToStructure({
      model: MODEL_NAME,
      view: (modelElement, { writer }) => {
        const attrs = readAttributes(modelElement);
        const viewWrapper = writer.createContainerElement(
          "div",
          { class: "bookmark-card" },
          buildCardChildren(attrs, writer),
        );
        return toWidget(viewWrapper, writer, { label: attrs.title || attrs.url || "bookmark card" });
      },
    });

    // Rebuilds the widget straight from the data-* attributes when a saved
    // story is loaded back into the editor — cheaper and more robust than
    // reverse-parsing the visible thumbnail/title/description markup.
    conversion.for("upcast").elementToElement({
      view: { name: "a", classes: "bookmark-card" },
      model: (viewElement, { writer }) => {
        const getAttr = (name: string) => viewElement.getAttribute(name) || undefined;
        const attrs: BookmarkCardAttributes = {
          url: getAttr("data-bookmark-url") || getAttr("href") || "",
          title: getAttr("data-title") || "",
        };
        const description = getAttr("data-description");
        const image = getAttr("data-image");
        const siteName = getAttr("data-site-name");
        const favicon = getAttr("data-favicon");
        if (description) attrs.description = description;
        if (image) attrs.image = image;
        if (siteName) attrs.siteName = siteName;
        if (favicon) attrs.favicon = favicon;
        return writer.createElement(MODEL_NAME, attrs);
      },
      converterPriority: "high",
    });

    // Clicking the card opens its URL in a new tab. The editing view root is
    // a <div> (see above), so this is the only way to open it — there's no
    // native <a> for the browser to navigate on its own.
    editor.editing.view.addObserver(ClickObserver);
    editor.editing.view.document.on("click", (_evt, data) => {
      const clicked = data.target;
      if (!clicked || !clicked.is("element")) {
        return;
      }
      const widgetElement = clicked.hasClass("bookmark-card")
        ? clicked
        : clicked.findAncestor({ classes: "bookmark-card" });
      if (!widgetElement) {
        return;
      }

      const modelElement = editor.editing.mapper.toModelElement(widgetElement);
      if (!modelElement || !modelElement.is("element", MODEL_NAME)) {
        return;
      }

      const url = modelElement.getAttribute("url") as string | undefined;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  }
}

/** Inserts a bookmark card at `position` (rather than the current selection) — mirrors AutoMediaEmbed's own `insertMedia` utility. */
export function insertBookmarkCard(
  editor: Editor,
  attributes: BookmarkCardAttributes,
  position: ModelPosition,
): void {
  editor.model.change((writer) => {
    const element = writer.createElement(MODEL_NAME, { ...attributes });
    editor.model.insertObject(element, position, null, { setSelection: "on" });
  });
}

interface LinkPreviewResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
    faviconUrl?: string;
  };
}

async function fetchBookmarkAttributes(url: string, signal: AbortSignal): Promise<BookmarkCardAttributes> {
  const response = await fetch(`${LINK_PREVIEW_ENDPOINT}?url=${encodeURIComponent(url)}`, { signal });
  const json: LinkPreviewResponse = await response.json();

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Failed to fetch link preview");
  }

  const attrs: BookmarkCardAttributes = {
    url: json.data.url,
    title: json.data.title || json.data.url,
  };
  if (json.data.description) attrs.description = json.data.description;
  if (json.data.imageUrl) attrs.image = json.data.imageUrl;
  if (json.data.siteName) attrs.siteName = json.data.siteName;
  if (json.data.faviconUrl) attrs.favicon = json.data.faviconUrl;
  return attrs;
}

function parseSoleUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed !== text || /\s/.test(trimmed)) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * Watches for a bare URL pasted alone (mirrors AutoMediaEmbed's own paste
 * detection in @ckeditor/ckeditor5-media-embed). If the URL isn't a
 * recognized media provider — AutoMediaEmbed already handles those — it
 * fetches a preview and swaps the pasted text for a bookmark card at the
 * exact paste position. Metadata fetch failures leave the pasted text as
 * plain text, same as if this plugin weren't installed.
 */
export class BookmarkCardAutoEmbed extends Plugin {
  static get requires() {
    return [BookmarkCardEditing, ClipboardPipeline, Delete, Undo, MediaEmbedEditing] as const;
  }

  static get pluginName() {
    return "BookmarkCardAutoEmbed" as const;
  }

  private _pendingController: AbortController | null = null;

  init() {
    const editor = this.editor;
    const modelDocument = editor.model.document;
    const clipboardPipeline = editor.plugins.get(ClipboardPipeline);

    this.listenTo(clipboardPipeline, "inputTransformation", () => {
      const firstRange = modelDocument.selection.getFirstRange();
      if (!firstRange) {
        return;
      }

      const leftLivePosition = ModelLivePosition.fromPosition(firstRange.start);
      leftLivePosition.stickiness = "toPrevious";
      const rightLivePosition = ModelLivePosition.fromPosition(firstRange.end);
      rightLivePosition.stickiness = "toNext";

      modelDocument.once(
        "change:data",
        () => {
          this._tryEmbedBookmark(leftLivePosition, rightLivePosition);
          leftLivePosition.detach();
          rightLivePosition.detach();
        },
        { priority: "low" },
      );
    });

    editor.commands.get("undo")?.on(
      "execute",
      () => {
        this._pendingController?.abort();
        this._pendingController = null;
      },
      { priority: "high" },
    );
  }

  destroy() {
    this._pendingController?.abort();
    this._pendingController = null;
    return super.destroy();
  }

  private _tryEmbedBookmark(leftPosition: ModelLivePosition, rightPosition: ModelLivePosition) {
    const editor = this.editor;
    const mediaRegistry = editor.plugins.get(MediaEmbedEditing).registry;

    const urlRange = new ModelLiveRange(leftPosition, rightPosition);
    let url = "";
    for (const node of urlRange.getWalker({ ignoreElementEnd: true })) {
      if (node.item.is("$textProxy")) {
        url += node.item.data;
      }
    }

    const soleUrl = parseSoleUrl(url);
    if (!soleUrl || mediaRegistry.hasMedia(soleUrl)) {
      urlRange.detach();
      return;
    }

    const insertPosition = ModelLivePosition.fromPosition(leftPosition);
    const controller = new AbortController();
    this._pendingController = controller;

    fetchBookmarkAttributes(soleUrl, controller.signal)
      .then((attributes) => {
        if (controller.signal.aborted || editor.state === "destroyed") {
          return;
        }
        if (this._pendingController === controller) {
          this._pendingController = null;
        }
        if (insertPosition.root.rootName === "$graveyard") {
          return;
        }
        editor.model.change((writer) => {
          writer.remove(urlRange);
          insertBookmarkCard(editor, attributes, insertPosition);
        });
        editor.plugins.get(Delete).requestUndoOnBackspace();
      })
      .catch(() => {
        if (this._pendingController === controller) {
          this._pendingController = null;
        }
      })
      .finally(() => {
        urlRange.detach();
        insertPosition.detach();
      });
  }
}
