import type { Editor, FileLoader, UploadAdapter, UploadResponse } from "ckeditor5";
import { FileRepository } from "ckeditor5";

// Routes in-editor image uploads (paste/drag-drop/toolbar insert) through the
// same /api/upload endpoint the banner image uploader uses — one upload
// service, reused, per the project's DRY requirement.
class ImageUploadAdapter implements UploadAdapter {
  private readonly loader: FileLoader;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;
    if (!file) {
      throw new Error("No file to upload");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message ?? "Image upload failed");
    }

    return { default: json.data.url as string };
  }

  abort(): void {
    // Uploads here run to completion or reject — nothing to cancel client-side.
  }
}

export function ImageUploadAdapterPlugin(editor: Editor): void {
  editor.plugins.get(FileRepository).createUploadAdapter = (loader) =>
    new ImageUploadAdapter(loader);
}
