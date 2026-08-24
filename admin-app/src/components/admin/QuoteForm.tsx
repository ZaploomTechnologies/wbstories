"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuoteImageUploadField } from "@/components/admin/QuoteImageUploadField";
import { createQuoteSchema, type CreateQuoteInput } from "@/validations/quote.validation";

interface QuoteFormProps {
  mode: "create" | "edit";
  quoteId?: string;
  defaultValues?: CreateQuoteInput;
}

const EMPTY_DEFAULTS: CreateQuoteInput = {
  image: { url: "" },
  quote: "",
  description: "",
  status: "draft",
};

export function QuoteForm({ mode, quoteId, defaultValues }: QuoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<CreateQuoteInput["status"] | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof createQuoteSchema>, unknown, z.output<typeof createQuoteSchema>>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  });

  function submitAs(status: CreateQuoteInput["status"]) {
    setValue("status", status);
    setPendingStatus(status);
    void handleSubmit(onSubmit)();
  }

  // `status`/`image` both have zod defaults, so react-hook-form tracks them
  // as optional while being edited but the resolver guarantees they're
  // filled in by the time onSubmit receives it (z.output, not z.input).
  async function onSubmit(values: CreateQuoteInput) {
    setIsSubmitting(true);
    try {
      const endpoint = mode === "create" ? "/api/admin/quotes" : `/api/admin/quotes/${quoteId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save quote");
      }

      toast.success(mode === "create" ? "Quote created" : "Quote updated");
      router.push("/quotes");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save quote");
    } finally {
      setIsSubmitting(false);
      setPendingStatus(null);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl">
      <div className="flex items-center justify-end gap-3 border-b pb-4">
        <Button type="button" variant="outline" onClick={() => router.push("/quotes")}>
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
        <Button type="button" disabled={isSubmitting} onClick={() => submitAs("published")}>
          {isSubmitting && pendingStatus === "published" ? "Saving..." : "Save as Published"}
        </Button>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <QuoteImageUploadField
                value={field.value?.url ? field.value : undefined}
                onChange={(image) => field.onChange(image ?? { url: "" })}
              />
            )}
          />
          {errors.image?.url && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {errors.image.url.message}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Textarea
              {...register("quote")}
              placeholder="Enter the quote text — line breaks are preserved when copied..."
              rows={6}
              aria-invalid={!!errors.quote}
              aria-describedby={errors.quote ? "quote-error" : undefined}
            />
            {errors.quote && (
              <p id="quote-error" className="mt-2 text-sm text-destructive" role="alert">
                {errors.quote.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              {...register("description")}
              placeholder="Short description or explanation for this quote..."
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-2 text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
