"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRightIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { cn } from "cn"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Brand } from "@/components/layout/brand"
import { isActivePath } from "@/components/layout/nav-link"
import type { SessionUser } from "@/components/layout/user-menu"
import { useSignOut } from "@/hooks/use-sign-out"
import { publicNav, dashboardForRole, routes } from "@/lib/site"

type MobileNavProps = {
  user: SessionUser | null
  isPending: boolean
}

export function MobileNav({ user, isPending }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut, isSigningOut } = useSignOut()

  const close = () => setOpen(false)

  async function handleSignOut() {
    close()
    await signOut()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-10 rounded-full focus-visible:ring-ring md:hidden"
        )}
      >
        <MenuIcon />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-sm gap-0 border-l border-border/80 bg-background p-0"
      >
        <SheetHeader className="border-b border-border/70 px-6 py-5">
          <SheetTitle className="sr-only">SalonBook navigation</SheetTitle>
          <Brand onNavigate={close} />
        </SheetHeader>

        <nav
          aria-label="Mobile"
          className="flex-1 overflow-y-auto px-6 py-2"
        >
          <ul className="flex flex-col">
            {publicNav.map((item, index) => {
              const active = isActivePath(pathname, item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className="group flex items-center justify-between border-b border-border/60 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className={cn(
                          "text-[0.6rem] tracking-[0.3em]",
                          active ? "text-brand-gold" : "text-muted-foreground"
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-display text-2xl leading-none",
                          active ? "text-brand-plum italic" : "text-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </span>

                    <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              )
            })}
            {user ? (
              <li>
                <Link
                  href={routes.salonDetails}
                  onClick={close}
                  aria-current={
                    isActivePath(pathname, routes.salonDetails) ? "page" : undefined
                  }
                  className="group flex items-center justify-between border-b border-border/60 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-[0.6rem] tracking-[0.3em] text-muted-foreground">
                      {String(publicNav.length + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl leading-none text-foreground">
                      Salon Details
                    </span>
                  </span>
                  <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="border-t border-border/70 px-6 py-6">
          {isPending ? (
            <div className="flex items-center gap-3" aria-hidden>
              <span className="size-11 animate-pulse rounded-full bg-muted" />
              <span className="flex flex-1 flex-col gap-2">
                <span className="h-3 w-28 animate-pulse rounded-full bg-muted" />
                <span className="h-2.5 w-36 animate-pulse rounded-full bg-muted" />
              </span>
            </div>
          ) : user ? (
            <>
              <div className="mb-5 flex items-center gap-3">
                <Avatar className="size-11 ring-1 ring-brand-gold/40">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-brand-cream font-display text-sm text-brand-plum">
                    {user.name.slice(0, 1).toUpperCase() ||
                      user.email.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-display text-lg leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href={dashboardForRole(user.role)}
                  onClick={close}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 w-full rounded-full text-[0.7rem] tracking-[0.18em] uppercase focus-visible:ring-ring"
                  )}
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="h-11 w-full rounded-full text-[0.7rem] tracking-[0.18em] uppercase focus-visible:ring-ring"
                >
                  <LogOutIcon />
                  {isSigningOut ? "Signing out…" : "Logout"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href={routes.signUp}
                onClick={close}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full rounded-full text-[0.7rem] tracking-[0.18em] uppercase focus-visible:ring-ring"
                )}
              >
                Sign Up
              </Link>
              <Link
                href={routes.signIn}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full rounded-full text-[0.7rem] tracking-[0.18em] uppercase focus-visible:ring-ring"
                )}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
