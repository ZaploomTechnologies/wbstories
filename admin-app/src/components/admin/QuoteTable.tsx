"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { useAdminQuotes } from "@/hooks/use-admin-quotes";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/helpers/date.helper";
import type { QuoteDTO } from "@/types/quote.types";

const PAGE_SIZE = 10;

export function QuoteTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const { quotes, meta, isLoading, refresh } = useAdminQuotes({
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch || undefined,
    status,
  });

  async function handleDelete() {
    if (!quoteToDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete quote");
      }
      toast.success("Quote deleted");
      setQuoteToDelete(null);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete quote");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search quotes..."
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as typeof status);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push("/quotes/new")}>New quote</Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : quotes.length === 0 ? (
        <EmptyState
          title="No quotes found"
          description="Try adjusting your search or filters, or create a new quote."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={quote.image.url}
                        alt="Quote"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{quote.description}</TableCell>
                  <TableCell>
                    <Badge variant={quote.status === "published" ? "default" : "secondary"}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.publishedAt ? formatDate(quote.publishedAt) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        nativeButton={false}
                        render={<Link href={`/quotes/${quote.id}/edit`} aria-label="Edit quote" />}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete quote"
                        onClick={() => setQuoteToDelete(quote)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!quoteToDelete}
        onOpenChange={(open) => !open && setQuoteToDelete(null)}
        title="Delete quote"
        description="Are you sure you want to delete this quote? This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
