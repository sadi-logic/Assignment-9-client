import Link from "next/link"
import { cn } from "cn"

import { routes, siteConfig } from "@/lib/site"

type BrandProps = {
  className?: string
  /** Optional hook so the mobile menu can close after navigating. */
  onNavigate?: () => void
}

export function Brand({ className, onNavigate }: BrandProps) {
  return (
    <Link
      href={routes.home}
      onClick={onNavigate}
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className
      )}
    >
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/50 bg-brand-cream/70 text-brand-plum transition-colors group-hover:border-brand-gold">
        <span className="font-display text-xl leading-none italic">S</span>
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-brand-gold"
        />
      </span>

      <span className="flex flex-col">
        <span className="font-display text-[1.6rem] leading-none tracking-tight text-foreground">
          Salon<span className="italic">Book</span>
          <span className="text-brand-gold">.</span>
        </span>
        <span className="mt-1 hidden text-[0.55rem] font-medium tracking-[0.34em] text-muted-foreground uppercase sm:block">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  )
}
