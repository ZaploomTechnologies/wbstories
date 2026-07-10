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
import { useAdminStories } from "@/hooks/use-admin-stories";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/helpers/date.helper";
import type { StorySummaryDTO } from "@/types/story.types";

const PAGE_SIZE = 10;

export function StoryTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [storyToDelete, setStoryToDelete] = useState<StorySummaryDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const { stories, meta, isLoading, refresh } = useAdminStories({
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch || undefined,
    status,
  });

  async function handleDelete() {
    if (!storyToDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/stories/${storyToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete story");
      }
      toast.success("Story deleted");
      setStoryToDelete(null);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete story");
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
            placeholder="Search stories..."
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
        <Button onClick={() => router.push("/stories/new")}>New story</Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : stories.length === 0 ? (
        <EmptyState
          title="No stories found"
          description="Try adjusting your search or filters, or create a new story."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reading time</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      {story.bannerImage && (
                        <Image
                          src={story.bannerImage.url}
                          alt={story.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{story.title}</TableCell>
                  <TableCell>
                    <Badge variant={story.status === "published" ? "default" : "secondary"}>
                      {story.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{story.readingTime} min</TableCell>
                  <TableCell>{story.publishedAt ? formatDate(story.publishedAt) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        nativeButton={false}
                        render={<Link href={`/stories/${story.id}/edit`} aria-label="Edit story" />}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete story"
                        onClick={() => setStoryToDelete(story)}
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
        open={!!storyToDelete}
        onOpenChange={(open) => !open && setStoryToDelete(null)}
        title="Delete story"
        description={`Are you sure you want to delete "${storyToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
