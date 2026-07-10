import { StoryTable } from "@/components/admin/StoryTable";

export const dynamic = "force-dynamic";

export default function AdminStoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stories</h1>
        <p className="text-muted-foreground">Manage all your stories.</p>
      </div>
      <StoryTable />
    </div>
  );
}
