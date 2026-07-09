import { env } from "@/config/env";

// The single file to edit when repurposing this CMS (Blog, News Portal,
// Docs site, Knowledge Base, ...) — public-facing branding and nav live
// here, not scattered across components.
export const siteConfig = {
  name: "WB Stories",
  tagline: "Business Stories That Matter",
  description: "Insights, updates, and stories from the world of business.",
  url: env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ""),
  ogImage: "/images/og-default.png",
  builtBy: {
    name: "Zaploom Technologies",
    url: "https://zaploom.in/",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
