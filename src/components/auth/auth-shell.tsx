import type { ReactNode } from "react"

import { AuthSessionGuard } from "@/components/auth/auth-session-guard"

/**
 * Shared frame for /sign-in and /sign-up so both routes feel like one
 * experience: an editorial salon panel on desktop, a calm single column
 * form on mobile.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-1 bg-background">
      <AuthSessionGuard />

      <div className="mx-auto grid w-full max-w-[84rem] flex-1 lg:grid-cols-[1.02fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-plum px-12 py-14 text-primary-foreground lg:flex xl:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-28 -right-28 size-[30rem] rounded-full border border-brand-gold/20" />
            <div className="absolute top-36 -right-10 size-[19rem] rounded-full border border-brand-gold/10" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-black/25 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-brand-gold/50 text-brand-gold">
              <span className="font-display text-lg leading-none italic">S</span>
            </span>
            <span className="text-[0.6rem] tracking-[0.36em] uppercase text-primary-foreground/60">
              SalonBook · Atelier
            </span>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="text-[0.6rem] tracking-[0.34em] uppercase text-brand-gold">
              Est. 2026
            </p>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] xl:text-5xl">
              Rituals of care,{" "}
              <span className="text-brand-gold italic">beautifully</span>{" "}
              booked.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/65">
              Hair, skin and nail appointments in one quiet place — your
              stylist, your time slot, and your payment in a single flow.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.58rem] tracking-[0.26em] uppercase text-primary-foreground/45">
            <span>Hair &amp; Styling</span>
            <span aria-hidden className="size-1 rounded-full bg-brand-gold/60" />
            <span>Skin &amp; Facials</span>
            <span aria-hidden className="size-1 rounded-full bg-brand-gold/60" />
            <span>Nails &amp; Spa</span>
          </div>
        </aside>

        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:border-l lg:border-border/70 lg:px-12 lg:py-10 xl:px-16 xl:py-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </section>
  )
}
