"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { BalloonEditor } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "./ckeditor-medium-theme.css";
import { CKEDITOR_PLUGINS, CKEDITOR_BASE_CONFIG } from "@/lib/ckeditor.config";
import { ImageUploadAdapterPlugin } from "@/lib/ckeditor-upload-adapter";

interface CKEditorFieldProps {
  initialData?: string;
  onChange: (html: string) => void;
}

// Only ever loaded via next/dynamic(..., { ssr: false }) from StoryForm —
// CKEditor touches the DOM at instantiation and cannot be server-rendered.
export default function CKEditorField({ initialData = "", onChange }: CKEditorFieldProps) {
  return (
    <div>
      <CKEditor
        editor={BalloonEditor}
        data={initialData}
        config={{
          ...CKEDITOR_BASE_CONFIG,
          plugins: CKEDITOR_PLUGINS,
          extraPlugins: [ImageUploadAdapterPlugin],
        }}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
