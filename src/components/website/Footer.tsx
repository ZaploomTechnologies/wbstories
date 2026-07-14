import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { LinkedinIcon, InstagramIcon, WhatsappIcon } from "@/components/website/social-icons";

const socialLinks = [
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
  { label: "WhatsApp", href: siteConfig.socials.whatsapp, Icon: WhatsappIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t">
      <div className="flex select-none flex-wrap items-baseline justify-center gap-x-3 pb-6 pt-8">
        <Link
          href={siteConfig.builtBy.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Powered by
        </Link>
        <p
          aria-hidden="true"
          className="font-extrabold uppercase leading-none tracking-tight text-foreground/5"
          style={{ fontSize: "clamp(2.5rem, 14vw, 10rem)" }}
        >
          Zaploom
        </p>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 pb-8 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <nav className="flex gap-4">
            {siteConfig.nav.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
