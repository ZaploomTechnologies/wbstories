import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LocalUploadResult {
  url: string;
  publicId: string;
}

const UPLOAD_SUBDIR = "banners";
export const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// publicId is client-supplied in a couple of places (the "previousPublicId"
// form field, and the GET route that serves these files back out) — resolve
// and confirm it stays inside UPLOAD_ROOT before touching the filesystem, so
// a crafted value like "../../.env" can't escape the uploads directory.
export function resolveWithinUploadRoot(publicId: string): string | null {
  const resolved = path.resolve(UPLOAD_ROOT, publicId);
  const isWithinUploadRoot =
    resolved === UPLOAD_ROOT || resolved.startsWith(UPLOAD_ROOT + path.sep);
  return isWithinUploadRoot ? resolved : null;
}

export async function uploadImageBuffer(buffer: Buffer, mimeType: string): Promise<LocalUploadResult> {
  const extension = EXTENSION_BY_MIME_TYPE[mimeType] ?? "";
  const filename = `${randomUUID()}${extension}`;
  const publicId = `${UPLOAD_SUBDIR}/${filename}`;

  const dir = path.join(UPLOAD_ROOT, UPLOAD_SUBDIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${publicId}`, publicId };
}

export async function deleteImage(publicId: string): Promise<void> {
  const resolved = resolveWithinUploadRoot(publicId);
  if (!resolved) {
    return;
  }

  try {
    await unlink(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
