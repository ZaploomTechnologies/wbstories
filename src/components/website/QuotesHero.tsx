import { ChevronDown } from "lucide-react";

function HeroDecorations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      {/* left side */}
      <svg
        className="animate-float absolute top-20 left-[10%] size-20 text-[var(--chart-2)] xl:left-[16%]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          fill="currentColor"
          fillOpacity="0.5"
          d="M44.7,-54.4C57.5,-45.6,66.6,-31.1,70.1,-15.4C73.5,0.3,71.3,17.2,63.3,31.1C55.3,44.9,41.6,55.7,26.2,61.9C10.8,68.1,-6.3,69.7,-22.1,65.2C-37.9,60.7,-52.4,50.1,-61.2,35.9C-70,21.7,-73.1,3.8,-69.5,-12.5C-65.9,-28.8,-55.6,-43.5,-42.1,-52.3C-28.6,-61.1,-14.3,-64,1.3,-65.7C16.9,-67.4,31.8,-63.2,44.7,-54.4Z"
          transform="translate(100 100)"
        />
      </svg>

      <span className="animate-float-reverse absolute bottom-28 left-[16%] size-3 rounded-full bg-[var(--chart-3)] opacity-60 xl:left-[22%]" />

      {/* right side */}
      <svg
        className="animate-spin-slow absolute top-12 right-[8%] size-24 text-[var(--primary)] opacity-40 xl:right-[14%]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 10"
        />
      </svg>

      <span className="animate-float absolute bottom-24 right-[16%] size-4 rounded-full bg-[var(--chart-5)] opacity-50 xl:right-[22%]" />
    </div>
  );
}

export function QuotesHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <HeroDecorations />

      <h1 className="relative max-w-3xl font-serif text-4xl leading-tight tracking-tight text-balance sm:text-6xl">
        Words worth <em className="italic">carrying with you</em>
      </h1>

      <blockquote className="relative mt-10 max-w-md text-sm text-muted-foreground sm:text-base">
        <p className="font-serif italic">
          &ldquo;The right quote, at the right moment, can change the way you see everything
          else.&rdquo;
        </p>
        <footer className="mt-3 font-serif italic">— WB Stories</footer>
      </blockquote>

      <a
        href="#latest-quotes"
        aria-label="Scroll to latest quotes"
        className="absolute bottom-10 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className="size-6 animate-bounce" />
      </a>
    </section>
  );
}
