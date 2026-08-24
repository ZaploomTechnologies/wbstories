import Image from "next/image";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { ShareButton } from "@/components/shared/ShareButton";
import { CopyTextButton } from "@/components/shared/CopyTextButton";
import { siteConfig } from "@/config/site.config";
import type { QuoteDTO } from "@/types/quote.types";

interface QuoteCardProps {
  quote: QuoteDTO;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const anchorId = `quote-${quote.id}`;
  const shareUrl = `${siteConfig.url}/quotes#${anchorId}`;
  const filename = `${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-quote-${quote.id}.jpg`;

  return (
    <article
      id={anchorId}
      className="flex scroll-mt-24 gap-4 rounded-lg border bg-card p-4 sm:gap-5"
    >
      {/* object-contain (not cover) — the image must show in full, uncropped;
          the fixed aspect box just keeps card rows a predictable height. */}
      <div className="relative aspect-3/4 w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
        <Image
          src={quote.image.url}
          alt={quote.description}
          fill
          sizes="(min-width: 640px) 160px, 112px"
          className="object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <p className="text-sm text-muted-foreground">{quote.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <DownloadButton url={quote.image.url} filename={filename} />
          <ShareButton url={shareUrl} title={siteConfig.name} text={quote.description} />
          <CopyTextButton text={quote.quote} />
        </div>
      </div>
    </article>
  );
}
