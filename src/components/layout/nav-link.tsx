"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

/**
 * True when `href` matches the current route (exact match, or a nested route
 * such as /services/abc for /services).
 */
export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

type NavLinkProps = {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname()
  const active = isActivePath(pathname, href)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex items-center rounded-sm py-1 text-[0.7rem] font-medium tracking-[0.2em] uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-gold transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover/nav:opacity-40"
        )}
      />
    </Link>
  )
}
