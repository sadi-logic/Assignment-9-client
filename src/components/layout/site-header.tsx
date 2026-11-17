"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { buttonVariants } from "@/components/ui/button"
import { Brand } from "@/components/layout/brand"
import { MobileNav } from "@/components/layout/mobile-nav"
import { NavLink } from "@/components/layout/nav-link"
import { UserMenu } from "@/components/layout/user-menu"
import { publicNav, routes } from "@/lib/site"
import { cn } from "cn"

/**
 * Global site header.
 *
 * It is a client component because it needs the live auth session (so the
 * navbar updates the instant a user signs in or out) and the current pathname
 * for active link states. Better Auth's session store is shared, so this costs
 * a single request rather than one per consumer.
 */
export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/60 to-transparent"
      />

      <a
        href="#main-content"
        className="sr-only rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-16 w-full max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        <Brand />

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {publicNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-6 w-14 animate-pulse rounded-full bg-muted" />
              <span className="h-9 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href={routes.signIn}
                className="rounded-full px-3 py-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign In
              </Link>
              <Link
                href={routes.signUp}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-5 text-[0.7rem] tracking-[0.18em] uppercase shadow-none focus-visible:ring-ring"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <MobileNav user={user} isPending={isPending} />
      </div>
    </header>
  )
}
