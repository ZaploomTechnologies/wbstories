import { QuoteForm } from "@/components/admin/QuoteForm";

export default function NewQuotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New quote</h1>
        <p className="text-muted-foreground">Create a new quote.</p>
      </div>
      <QuoteForm mode="create" />
    </div>
  );
}
