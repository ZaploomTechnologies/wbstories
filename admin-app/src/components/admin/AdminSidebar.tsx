"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stories", label: "Stories", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 md:flex">
      <div className="flex h-14 items-center border-b px-4 font-semibold">WB Stories Admin</div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
        <div className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50">
          <Settings className="size-4" />
          Settings
          <span className="ml-auto text-xs">Soon</span>
        </div>
      </nav>
      <div className="border-t p-3 text-center text-xs text-muted-foreground">
        Powered by{" "}
        <Link
          href={siteConfig.builtBy.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-foreground"
        >
          {siteConfig.builtBy.name}
        </Link>
      </div>
    </aside>
  );
}
