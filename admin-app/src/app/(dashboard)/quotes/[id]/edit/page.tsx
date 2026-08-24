import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { adminFetch } from "@/lib/server-fetch";
import type { ApiResponse } from "@/types/api.types";
import type { QuoteDTO } from "@/types/quote.types";
import type { CreateQuoteInput } from "@/validations/quote.validation";

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params;

  const res = await adminFetch(`/api/admin/quotes/${id}`);
  if (res.status === 404) {
    notFound();
  }
  const json: ApiResponse<QuoteDTO> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load quote");
  }
  const quote = json.data;

  const defaultValues: CreateQuoteInput = {
    image: quote.image,
    quote: quote.quote,
    description: quote.description,
    status: quote.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit quote</h1>
      </div>
      <QuoteForm mode="edit" quoteId={quote.id} defaultValues={defaultValues} />
    </div>
  );
}
