"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisitCounterChip() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/site-stats/visit", { method: "POST" })
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled && body?.success) {
          setCount(body.data.visitCount as number);
        }
      })
      .catch(() => {
        // Silent — a failed visit-count ping shouldn't disrupt the page.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border bg-background/95",
        "px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-lg backdrop-blur",
      )}
    >
      <Eye className="size-4" />
      {count.toLocaleString()} visits
    </div>
  );
}
