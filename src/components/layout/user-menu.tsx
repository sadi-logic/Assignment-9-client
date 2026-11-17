"use client"

import Link from "next/link"
import { ChevronDownIcon, LayoutDashboardIcon, LogOutIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSignOut } from "@/hooks/use-sign-out"
import { dashboardForRole } from "@/lib/site"

export type SessionUser = {
  name: string
  email: string
  image?: string | null
  role?: string | null
  isBlocked?: boolean | null
}

function getInitials({ name, email }: SessionUser) {
  const source = name.trim() || email.split("@")[0] || ""
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "SB"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function UserMenu({ user }: { user: SessionUser }) {
  const { signOut, isSigningOut } = useSignOut()
  const firstName = user.name.trim().split(/\s+/)[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-transparent py-1 pr-3 pl-1 transition-colors outline-none hover:border-border/80 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9 ring-1 ring-brand-gold/40">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-brand-cream font-display text-sm text-brand-plum">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>

        <span className="hidden max-w-32 truncate text-[0.7rem] font-medium tracking-[0.16em] uppercase lg:block">
          {firstName}
        </span>

        <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl p-1.5"
      >
        <div className="px-2.5 pt-2 pb-2.5">
          <p className="truncate font-display text-lg leading-tight">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href={dashboardForRole(user.role)} />}
          className="gap-2.5 px-2.5 py-2 text-[0.8rem]"
        >
          <LayoutDashboardIcon className="text-brand-plum" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={signOut}
          disabled={isSigningOut}
          className="gap-2.5 px-2.5 py-2 text-[0.8rem]"
        >
          <LogOutIcon className="text-muted-foreground" />
          {isSigningOut ? "Signing out…" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
