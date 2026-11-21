"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useSignOut } from "@/hooks/use-sign-out"
import { useSession } from "@/lib/auth-client"
import { menuItemsByRole, type MenuItem } from "@/lib/dashboard-menu"
import { isUserRole, ROLE_LABELS, type UserRole } from "@/lib/roles"
import { routes, siteConfig } from "@/lib/site"

const EMPTY_MENU: MenuItem[] = []

function getInitials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || ""
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "SB"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const { setOpenMobile } = useSidebar()
  const { signOut, isSigningOut } = useSignOut()

  const rawRole = session?.user?.role
  const role: UserRole | null = isUserRole(rawRole) ? rawRole : null
  const menuItems = role ? menuItemsByRole[role] : EMPTY_MENU
  const user = session?.user


  const activeUrl = useMemo(() => {
    if (!pathname) return undefined

    return menuItems
      .filter(
        (item) =>
          pathname === item.url || pathname.startsWith(`${item.url}/`)
      )
      .sort((a, b) => b.url.length - a.url.length)[0]?.url
  }, [menuItems, pathname])

  return (
    <Sidebar
      collapsible="icon"
      className="top-16! h-[calc(100svh-4rem)]! border-r border-sidebar-border/70 lg:top-20! lg:h-[calc(100svh-5rem)]!"
    >
      <SidebarHeader className="gap-0 border-b border-sidebar-border/70 px-2 py-3">
        <Link
          href={routes.home}
          className="group flex items-center gap-3 rounded-xl px-1.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/50 bg-brand-cream/80 font-display text-lg leading-none italic text-brand-plum transition-colors group-hover:border-brand-gold">
            S
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-brand-gold"
            />
          </span>

          <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-[1.35rem] leading-none text-foreground">
              Salon<span className="italic">Book</span>
              <span className="text-brand-gold">.</span>
            </span>
            <span className="mt-1 truncate text-[0.5rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
              {siteConfig.tagline}
            </span>
          </span>
        </Link>

        {role ? (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-brand-gold/25 bg-brand-cream/50 px-2 py-1.5 text-[0.5rem] font-medium tracking-[0.28em] text-brand-plum/80 uppercase group-data-[collapsible=icon]:hidden">
            <span aria-hidden className="size-1 rounded-full bg-brand-gold" />
            {ROLE_LABELS[role]} access
          </p>
        ) : null}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          {!isPending && role ? (
            <SidebarGroupLabel className="px-2 text-[0.55rem] font-medium tracking-[0.3em] text-muted-foreground/80 uppercase">
              {role === "admin" ? "Salon management" : "My salon"}
            </SidebarGroupLabel>
          ) : null}

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {isPending ? (
                <div className="flex flex-col gap-1.5 px-1 py-1">
                  {[0, 1, 2].map((row) => (
                    <Skeleton
                      key={row}
                      className="h-9 w-full rounded-xl bg-sidebar-accent/60"
                    />
                  ))}
                </div>
              ) : menuItems.length > 0 ? (
                menuItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.url}
                            onClick={() => setOpenMobile(false)}
                          />
                        }
                        isActive={item.url === activeUrl}
                        aria-current={item.url === activeUrl ? "page" : undefined}
                        tooltip={item.name}
                        className="h-10 gap-3 rounded-xl px-2.5 text-[0.82rem] font-normal text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-brand-plum data-active:font-medium data-active:text-primary-foreground"
                      >
                        <Icon />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              ) : (
                <p className="px-2 py-3 text-xs leading-relaxed text-muted-foreground">
                  Sign in to see your dashboard navigation.
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        {isPending ? (
          <div className="flex items-center gap-2 px-1 py-1">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 rounded-xl px-1 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5">
            <Avatar className="size-9 shrink-0 ring-1 ring-brand-gold/40">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-brand-cream font-display text-sm text-brand-plum">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-[0.8rem] font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-[0.68rem] text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => void signOut()}
              disabled={isSigningOut}
              aria-label={isSigningOut ? "Signing out" : "Sign out"}
              className="shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-brand-plum group-data-[collapsible=icon]:hidden"
            >
              <LogOutIcon />
            </Button>
          </div>
        ) : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
