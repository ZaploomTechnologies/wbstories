import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LocalUploadResult {
  url: string;
  publicId: string;
}

const UPLOAD_SUBDIR = "banners";
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function uploadImageBuffer(buffer: Buffer, mimeType: string): Promise<LocalUploadResult> {
  const extension = EXTENSION_BY_MIME_TYPE[mimeType] ?? "";
  const filename = `${randomUUID()}${extension}`;
  const publicId = `${UPLOAD_SUBDIR}/${filename}`;

  const dir = path.join(UPLOAD_ROOT, UPLOAD_SUBDIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${publicId}`, publicId };
}

// publicId is client-supplied (the "previousPublicId" form field) — resolve
// and confirm it stays inside UPLOAD_ROOT before touching the filesystem, so
// a crafted value like "../../.env" can't be used to delete arbitrary files.
export async function deleteImage(publicId: string): Promise<void> {
  const resolved = path.resolve(UPLOAD_ROOT, publicId);
  const isWithinUploadRoot =
    resolved === UPLOAD_ROOT || resolved.startsWith(UPLOAD_ROOT + path.sep);
  if (!isWithinUploadRoot) {
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
