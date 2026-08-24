import { QuoteTable } from "@/components/admin/QuoteTable";

export const dynamic = "force-dynamic";

export default function AdminQuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <p className="text-muted-foreground">Manage all your quotes.</p>
      </div>
      <QuoteTable />
    </div>
  );
}
