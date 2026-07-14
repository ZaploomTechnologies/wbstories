import { ContactInfo } from "@/components/website/ContactInfo";
import { ContactMap } from "@/components/website/ContactMap";
import { buildMetadata } from "@/helpers/metadata.helper";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Have a question or a story idea? Get in touch with WB Stories.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
        <ContactInfo />
        <ContactMap />
      </div>
    </div>
  );
}
