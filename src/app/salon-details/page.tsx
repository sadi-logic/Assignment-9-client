import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  ArrowUpRightIcon,
  Clock3Icon,
  MailIcon,
  MapPinIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { routes, signInHref, siteConfig } from "@/lib/site"
import { SERVICE_CATEGORIES } from "@/lib/services"

export const metadata: Metadata = {
  title: "Salon Details",
  description:
    "Get to know SalonBook, explore our salon services, and find our location and contact details.",
}

export default function SalonDetailsPage() {
  return (
    <main className="flex-1 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <Suspense fallback={<SalonDetailsSkeleton />}>
          <SalonDetailsContent />
        </Suspense>
      </div>
    </main>
  )
}

async function SalonDetailsContent() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) {
    redirect(signInHref(routes.salonDetails))
  }
  if (session.user.isBlocked) {
    redirect(routes.home)
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-brand-cream/60 px-6 py-10 sm:px-10 sm:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-gold/15 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-brand-blush/40 blur-3xl"
        />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <div>
            <p className="text-[0.6rem] font-medium tracking-[0.34em] text-brand-gold uppercase">
              A little time, just for you
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
              Welcome to{" "}
              <span className="text-brand-plum italic">{siteConfig.name}.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A considered salon menu for hair, skin, and beauty. Explore
              treatments, see clear prices and durations, then request an
              appointment that suits you.
            </p>
            <Button
              nativeButton={false}
              render={<Link href={routes.services} />}
              className="mt-7 h-11 rounded-full px-6 text-[0.65rem] tracking-[0.16em] uppercase"
            >
              Explore services
              <ArrowUpRightIcon aria-hidden />
            </Button>
          </div>

          <div
            aria-hidden
            className="relative mx-auto hidden h-64 w-48 sm:block"
          >
            <div className="absolute inset-0 rounded-t-full rounded-b-2xl border border-brand-gold/40 bg-linear-to-b from-brand-plum/10 via-brand-cream/60 to-brand-cream" />
            <div className="absolute inset-3 rounded-t-full rounded-b-xl border border-brand-gold/25" />
            <div className="absolute inset-x-0 bottom-8 text-center">
              <SparklesIcon className="mx-auto size-5 text-brand-gold" />
              <span className="mt-3 block font-display text-4xl leading-none text-brand-plum">
                Feel like you
              </span>
              <span className="mt-2 block text-[0.48rem] tracking-[0.28em] text-muted-foreground uppercase">
                {siteConfig.tagline}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
        <section className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-brand-gold">
            <ScissorsIcon aria-hidden className="size-4" />
            <p className="text-[0.58rem] font-medium tracking-[0.28em] uppercase">
              Our salon
            </p>
          </div>
          <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">
            Thoughtful care, from the first visit.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            SalonBook brings the salon experience together in one place. Browse
            our available treatments, choose a preferred date and time, and
            follow your request from review through confirmation.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every service includes its description, estimated duration, and
            price so you can choose with confidence before you book.
          </p>

          <div className="mt-7 border-t border-border/70 pt-5">
            <p className="text-[0.58rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Service categories
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-xs text-foreground/80"
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-3xl border border-border/70 bg-card/60 p-6">
            <p className="text-[0.58rem] font-medium tracking-[0.28em] text-brand-gold uppercase">
              Find us
            </p>
            <div className="mt-5 flex items-start gap-3">
              <MapPinIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-brand-plum"
              />
              <div>
                <h2 className="font-display text-xl text-foreground">
                  Salon location
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dhaka, Bangladesh
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 border-t border-border/70 pt-5">
              <Clock3Icon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-brand-plum"
              />
              <div>
                <h2 className="font-display text-xl text-foreground">
                  Opening hours
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  10:00 AM – 9:00 PM
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-brand-plum p-6 text-brand-cream">
            <MailIcon aria-hidden className="size-5 text-brand-gold" />
            <h2 className="mt-4 font-display text-2xl">Questions?</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-cream/75">
              Get in touch with the SalonBook team.
            </p>
            <a
              href="mailto:sadullasadi99@gmail.com"
              className="mt-4 inline-block text-sm text-brand-gold underline decoration-brand-gold/50 underline-offset-4 hover:decoration-brand-gold"
            >
              sadullasadi99@gmail.com
            </a>
          </section>
        </aside>
      </div>
    </>
  )
}

function SalonDetailsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-72 rounded-3xl bg-muted/60" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]">
        <div className="h-80 rounded-3xl bg-muted/60" />
        <div className="grid gap-4">
          <div className="h-40 rounded-3xl bg-muted/60" />
          <div className="h-32 rounded-3xl bg-muted/60" />
        </div>
      </div>
    </div>
  )
}