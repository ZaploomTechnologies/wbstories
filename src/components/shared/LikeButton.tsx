"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getOrCreateClientId } from "@/utils/client-id.util";
import { MAX_LIKES_PER_CLIENT } from "@/constants/like.constants";

interface LikeButtonProps {
  slug: string;
  initialTotalLikes: number;
}

interface LikeStatusResponse {
  success: boolean;
  data: { totalLikes: number; clientLikeCount: number; capped: boolean; incremented?: boolean };
}

interface ConfettiParticle {
  id: number;
  angle: number;
}

const CONFETTI_ANGLES = [-60, -30, -10, 10, 30, 60];
const DEBOUNCE_MS = 600;

export function LikeButton({ slug, initialTotalLikes }: LikeButtonProps) {
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes);
  const [clientLikeCount, setClientLikeCount] = useState(0);
  const [capped, setCapped] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  const pendingDeltaRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdRef = useRef(0);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    const clientId = getOrCreateClientId();
    clientIdRef.current = clientId;

    fetch(`/api/stories/${slug}/like?clientId=${encodeURIComponent(clientId)}`)
      .then((res) => res.json())
      .then((body: LikeStatusResponse) => {
        if (body?.success) {
          setTotalLikes(body.data.totalLikes);
          setClientLikeCount(body.data.clientLikeCount);
          setCapped(body.data.capped);
        }
      })
      .catch(() => {
        // Silent — heart just falls back to its SSR-initial (unliked) state.
      });
  }, [slug]);

  function flush(useKeepalive = false) {
    const delta = pendingDeltaRef.current;
    if (delta === 0) {
      return;
    }
    pendingDeltaRef.current = 0;

    const clientId = clientIdRef.current ?? getOrCreateClientId();
    fetch(`/api/stories/${slug}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, delta }),
      keepalive: useKeepalive,
    })
      .then((res) => res.json())
      .then((body: LikeStatusResponse) => {
        if (!body?.success) {
          throw new Error("Like request failed");
        }
        // Snap optimistic state to the authoritative server response.
        setTotalLikes(body.data.totalLikes);
        setClientLikeCount(body.data.clientLikeCount);
        setCapped(body.data.capped);
      })
      .catch(() => {
        toast.error("Couldn't register your like. Please try again.");
      });
  }

  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      flushRef.current(true);
    };
  }, [slug]);

  function handleClick() {
    if (clientLikeCount >= MAX_LIKES_PER_CLIENT || capped) {
      toast.info(`You've reached the max of ${MAX_LIKES_PER_CLIENT} likes for this story`);
      return;
    }

    const nextClientLikeCount = clientLikeCount + 1;
    setClientLikeCount(nextClientLikeCount);
    setTotalLikes((t) => t + 1);
    if (nextClientLikeCount >= MAX_LIKES_PER_CLIENT) {
      setCapped(true);
    }

    pendingDeltaRef.current += 1;
    setPopKey((key) => key + 1);

    const id = particleIdRef.current++;
    const angle = CONFETTI_ANGLES[Math.floor(Math.random() * CONFETTI_ANGLES.length)];
    setParticles((current) => [...current, { id, angle }]);
    setTimeout(() => {
      setParticles((current) => current.filter((p) => p.id !== id));
    }, 600);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => flush(), DEBOUNCE_MS);
  }

  const liked = clientLikeCount > 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this story" : "Like this story"}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 overflow-visible rounded-full border bg-background/95",
        "px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur transition-colors",
        "hover:bg-muted",
      )}
    >
      <span className="relative inline-flex">
        <Heart
          key={popKey}
          className={cn(
            "size-4",
            liked ? "fill-red-500 text-red-500" : "text-muted-foreground",
            popKey > 0 && "animate-like-bounce",
          )}
        />
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="animate-like-confetti pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-red-500"
            style={{ "--confetti-angle": `${particle.angle}deg` } as CSSProperties}
          />
        ))}
      </span>
      <span>{totalLikes.toLocaleString()}</span>
    </button>
  );
}
