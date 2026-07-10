import { StoryForm } from "@/components/admin/StoryForm";

export default function NewStoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New story</h1>
        <p className="text-muted-foreground">Create a new story.</p>
      </div>
      <StoryForm mode="create" />
    </div>
  );
}
