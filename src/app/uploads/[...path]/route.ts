import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { resolveWithinUploadRoot } from "@/utils/local-storage.util";

// Uploaded images are written to disk after the server has already booted
// (see local-storage.util.ts), so Next's built-in /public static serving —
// which only reflects the filesystem as of process start — never sees them
// in production. This route reads the file fresh on every request instead.
export const runtime = "nodejs";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const contentType = CONTENT_TYPE_BY_EXTENSION[path.extname(segments.at(-1) ?? "").toLowerCase()];
  const resolved = contentType ? resolveWithinUploadRoot(segments.join("/")) : null;

  if (!resolved) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const info = await stat(resolved);
    const buffer = await readFile(resolved);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType!,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
