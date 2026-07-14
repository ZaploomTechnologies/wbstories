// This file is imported by client components (e.g. AdminSidebar), so it
// must only ever touch NEXT_PUBLIC_* vars read directly off process.env —
// Next.js inlines just that prefix into browser bundles. Going through the
// shared `env` config (which also validates server-only secrets like
// MONGODB_URI and JWT_SECRET) would drag those checks into client code,
// where those vars are never present and validation would always fail.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

// The single file to edit when repurposing this CMS (Blog, News Portal,
// Docs site, Knowledge Base, ...) — public-facing branding and nav live
// here, not scattered across components.
export const siteConfig = {
  name: "WB Stories",
  tagline: "Business Stories That Matter",
  description: "Insights, updates, and stories from the world of business.",
  url: siteUrl,
  ogImage: "/images/og-default.png",
  builtBy: {
    name: "Zaploom Technologies",
    url: "https://zaploom.in/",
  },
  socials: {
    linkedin: "https://linkedin.com/company/zaploom/",
    instagram: "https://www.instagram.com/zaploomtechnologies",
    whatsapp: "https://wa.me/919033608708",
  },
  contact: {
    addressLines: ["406, Square One Commercial, Bhimrad-Althan Rd", "Apcha Nagar, Surat, Gujarat 395017"],
    email: "info@zaploom.in",
    phones: ["+91 8200923860", "+91 9033608708"],
    officeHours: ["Mon - Fri: 9:00 AM - 6:00 PM"],
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
