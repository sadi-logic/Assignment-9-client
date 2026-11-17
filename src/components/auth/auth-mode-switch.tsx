"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { routes } from "@/lib/site"

const modes = [
  { href: routes.signIn, label: "Sign In" },
  { href: routes.signUp, label: "Create Account" },
] as const

/**
 * URL-driven switch between the two auth routes. Because it is plain links,
 * the correct form is restored on refresh, deep links and back/forward.
 */
export function AuthModeSwitch() {
  const pathname = usePathname()

  return (
    <div
      role="group"
      aria-label="Authentication"
      className="grid grid-cols-2 gap-1 rounded-full border border-border/80 bg-secondary/50 p-1"
    >
      {modes.map((mode) => {
        const active = pathname === mode.href

        return (
          <Link
            key={mode.href}
            href={mode.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2.5 text-center text-[0.68rem] font-medium tracking-[0.16em] uppercase transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-background text-foreground ring-1 ring-border/70"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode.label}
          </Link>
        )
      })}
    </div>
  )
}
