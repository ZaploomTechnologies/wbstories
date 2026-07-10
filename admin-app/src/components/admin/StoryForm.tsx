"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createStorySchema, type CreateStoryInput } from "@/validations/story.validation";

const CKEditorField = dynamic(() => import("@/components/admin/CKEditorField"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

interface StoryFormProps {
  mode: "create" | "edit";
  storyId?: string;
  defaultValues?: CreateStoryInput;
}

const EMPTY_DEFAULTS: CreateStoryInput = {
  title: "",
  content: "",
  status: "draft",
};

export function StoryForm({ mode, storyId, defaultValues }: StoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<CreateStoryInput["status"] | null>(null);
  const initialContent = defaultValues?.content ?? "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof createStorySchema>, unknown, z.output<typeof createStorySchema>>({
    resolver: zodResolver(createStorySchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  });

  function submitAs(status: CreateStoryInput["status"]) {
    setValue("status", status);
    setPendingStatus(status);
    void handleSubmit(onSubmit)();
  }

  // `status` has a zod .default(), so react-hook-form tracks it as optional
  // while being edited but the resolver guarantees it's filled in by the
  // time onSubmit receives it (z.output, not z.input).
  async function onSubmit(values: CreateStoryInput) {
    setIsSubmitting(true);
    try {
      const endpoint = mode === "create" ? "/api/admin/stories" : `/api/admin/stories/${storyId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save story");
      }

      toast.success(mode === "create" ? "Story created" : "Story updated");
      router.push("/stories");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save story");
    } finally {
      setIsSubmitting(false);
      setPendingStatus(null);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-3xl">
      <div className="flex items-center justify-end gap-3 border-b pb-4">
        <Button type="button" variant="outline" onClick={() => router.push("/stories")}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => submitAs("draft")}
        >
          {isSubmitting && pendingStatus === "draft" ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => submitAs("published")}
        >
          {isSubmitting && pendingStatus === "published" ? "Saving..." : "Save as Published"}
        </Button>
      </div>

      {/* Left padding gives CKEditor's block "+" button room to sit inside
          the canvas — it renders just outside the editable's own left edge,
          so with no padding here it would hang off in the page margin. */}
      <div className="mt-8 px-10">
        <input
          {...register("title")}
          placeholder="Title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className="w-full border-none bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
        />
        {errors.title && (
          <p id="title-error" className="mt-2 text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="mt-4 px-10">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <CKEditorField initialData={initialContent} onChange={field.onChange} />
          )}
        />
        {errors.content && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>
    </form>
  );
}
