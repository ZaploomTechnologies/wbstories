"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // AbortError just means the user closed the native share sheet.
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Couldn't share. Please try again.");
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Sharing isn't supported here — link copied instead");
    } catch {
      toast.error("Couldn't share. Please try again.");
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share">
      <Share2 className="size-4" />
    </Button>
  );
}
