import { DashboardCards } from "@/components/admin/DashboardCards";
import { adminFetch } from "@/lib/server-fetch";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { StorySummaryDTO } from "@/types/story.types";

export const dynamic = "force-dynamic";

async function listAdminStories(params: {
  page: number;
  limit: number;
  status: "all" | "published" | "draft";
  sortBy: string;
  order: "asc" | "desc";
}): Promise<PaginatedResult<StorySummaryDTO>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    status: params.status,
    sortBy: params.sortBy,
    order: params.order,
  });
  const res = await adminFetch(`/api/admin/stories?${query}`);
  const json: ApiResponse<StorySummaryDTO[]> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load stories");
  }
  return { items: json.data, meta: json.meta! };
}

export default async function AdminDashboardPage() {
  const [totalResult, publishedResult, draftResult, latest] = await Promise.all([
    listAdminStories({ page: 1, limit: 1, status: "all", sortBy: "publishedAt", order: "desc" }),
    listAdminStories({
      page: 1,
      limit: 1,
      status: "published",
      sortBy: "publishedAt",
      order: "desc",
    }),
    listAdminStories({ page: 1, limit: 1, status: "draft", sortBy: "publishedAt", order: "desc" }),
    listAdminStories({ page: 1, limit: 5, status: "all", sortBy: "createdAt", order: "desc" }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your stories.</p>
      </div>

      <DashboardCards
        total={totalResult.meta.total}
        published={publishedResult.meta.total}
        draft={draftResult.meta.total}
      />

      <div>
        <h2 className="mb-3 text-lg font-medium">Latest stories</h2>
        {latest.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stories yet.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {latest.items.map((story) => (
              <li key={story.id} className="flex items-center justify-between p-3 text-sm">
                <span className="font-medium">{story.title}</span>
                <span className="text-muted-foreground capitalize">{story.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
