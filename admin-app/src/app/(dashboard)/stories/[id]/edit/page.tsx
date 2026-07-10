import { notFound } from "next/navigation";
import { StoryForm } from "@/components/admin/StoryForm";
import { adminFetch } from "@/lib/server-fetch";
import type { ApiResponse } from "@/types/api.types";
import type { StoryDTO } from "@/types/story.types";
import type { CreateStoryInput } from "@/validations/story.validation";

interface EditStoryPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params;

  const res = await adminFetch(`/api/admin/stories/${id}`);
  if (res.status === 404) {
    notFound();
  }
  const json: ApiResponse<StoryDTO> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load story");
  }
  const story = json.data;

  const defaultValues: CreateStoryInput = {
    title: story.title,
    content: story.content,
    status: story.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit story</h1>
        <p className="text-muted-foreground">{story.title}</p>
      </div>
      <StoryForm mode="edit" storyId={story.id} defaultValues={defaultValues} />
    </div>
  );
}
