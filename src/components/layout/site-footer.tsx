import Link from "next/link"
import {
  ArrowUpRightIcon,
  CameraIcon,
  Clock3Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UsersRoundIcon,
} from "lucide-react"

import { Brand } from "@/components/layout/brand"
import { routes, siteConfig } from "@/lib/site"

const footerLinks = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
  { label: "Sign In", href: routes.signIn },
  { label: "Sign Up", href: routes.signUp },
] as const

const socialProfiles = [
  { label: "Instagram", Icon: CameraIcon },
  { label: "Facebook", Icon: UsersRoundIcon },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-brand-cream">
      <div className="mx-auto w-full max-w-[84rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-brand-plum px-6 py-5 text-brand-cream sm:px-9 sm:py-9 lg:px-12">
          <span
            aria-hidden
            className="absolute -top-20 -right-12 size-56 rounded-full border border-brand-gold/20"
          />
          <span
            aria-hidden
            className="absolute -top-12 -right-4 size-40 rounded-full border border-brand-gold/20"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
                A moment, just for you
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
                Make room for a little{" "}
                <span className="italic text-brand-gold">self-care.</span>
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-cream/75">
                Discover thoughtful hair, skin, and beauty services with{" "}
                {siteConfig.name}.
              </p>
            </div>

            <Link
              href={routes.services}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-brand-gold/50 px-5 text-[0.65rem] font-medium tracking-[0.16em] text-brand-cream uppercase transition-colors hover:border-brand-gold hover:bg-brand-cream/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
            >
              Explore services
              <ArrowUpRightIcon aria-hidden className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-9 py-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-[1.35fr_0.8fr_1fr_1fr_0.9fr] lg:gap-10 lg:py-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:pt-1">
            <h3 className="text-[0.6rem] font-semibold tracking-[0.2em] text-foreground uppercase">
              Explore
            </h3>
            <ul className="mt-4 grid gap-3">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand-plum focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading" className="lg:pt-1">
            <h3
              id="footer-contact-heading"
              className="text-[0.6rem] font-semibold tracking-[0.2em] text-foreground uppercase"
            >
              Get in touch
            </h3>
            <ul className="mt-4 grid gap-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <PhoneIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-gold" />
                <span>+918320183</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MailIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-gold" />
                <span>sadullasadi99@gmail.com</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-visit-heading" className="lg:pt-1">
            <h3
              id="footer-visit-heading"
              className="text-[0.6rem] font-semibold tracking-[0.2em] text-foreground uppercase"
            >
              Visit the salon
            </h3>
            <ul className="mt-4 grid gap-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPinIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-gold" />
                <span>Address : Dhaka,Bangladesh</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Clock3Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-gold" />
                <span>Opening hours : 10 A.M to 9 P.M</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="footer-social-heading" className="lg:pt-1">
            <h3
              id="footer-social-heading"
              className="text-[0.6rem] font-semibold tracking-[0.2em] text-foreground uppercase"
            >
              Follow along
            </h3>
            <ul className="mt-4 grid gap-3">
              {socialProfiles.map(({ label, Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  aria-label={`${label} profile not configured`}
                >
                  <Icon aria-hidden className="size-4 text-brand-gold" />
                  <span>{label}</span>
                  {/* <span className="text-xs text-muted-foreground/75">
                    (coming soon)
                  </span> */}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {siteConfig.name}. All rights reserved.
          </p>
          <p className="tracking-[0.14em] uppercase">
            Hair <span className="text-brand-gold">·</span> Skin{" "}
            <span className="text-brand-gold">·</span> Beauty
          </p>
        </div>
      </div>
    </footer>
  )
}
