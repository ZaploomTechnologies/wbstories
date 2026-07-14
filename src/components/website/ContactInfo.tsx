import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { LinkedinIcon, InstagramIcon, WhatsappIcon } from "@/components/website/social-icons";

const socialLinks = [
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
  { label: "WhatsApp", href: siteConfig.socials.whatsapp, Icon: WhatsappIcon },
];

export function ContactInfo() {
  const { contact } = siteConfig;

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Contact Us</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
        Have a question? Contact us now
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground">
        Have questions or need assistance? Our friendly team is ready to provide all the info you
        need — just get in touch.
      </p>

      <dl className="mt-10 space-y-6">
        <div className="flex gap-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <dd className="font-medium">
            {contact.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </dd>
        </div>
        <div className="flex gap-4">
          <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <dd>
            <Link href={`mailto:${contact.email}`} className="hover:text-foreground">
              {contact.email}
            </Link>
          </dd>
        </div>
        <div className="flex gap-4">
          <Phone className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <dd>
            {contact.phones.map((phone) => (
              <p key={phone}>
                <Link href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                  {phone}
                </Link>
              </p>
            ))}
          </dd>
        </div>
        <div className="flex gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <dd>
            <p className="font-medium">Office Hours</p>
            {contact.officeHours.map((line) => (
              <p key={line} className="text-muted-foreground">
                {line}
              </p>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex items-center gap-3">
        {socialLinks.map(({ label, href, Icon }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
