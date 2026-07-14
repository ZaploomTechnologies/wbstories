import { siteConfig } from "@/config/site.config";

export function ContactMap() {
  const address = siteConfig.contact.addressLines.join(", ");
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="h-80 overflow-hidden rounded-2xl border lg:h-full lg:min-h-[420px]">
      <iframe
        src={src}
        title="Office location map"
        className="size-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
