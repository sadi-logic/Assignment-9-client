import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserRoundIcon } from "lucide-react"

import { ProfileForm } from "@/components/dashboard/profile-form"
import { auth } from "@/lib/auth"
import { dashboardForRole, routes } from "@/lib/site"
import type { UserRole } from "@/lib/roles"

export function DashboardProfilePage({ role }: { role: UserRole }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent role={role} />
    </Suspense>
  )
}

async function ProfileContent({ role }: { role: UserRole }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) redirect(routes.signIn)
  if (session.user.role !== role) {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  return (
    <main className="mx-auto w-full max-w-3xl">
      <p className="inline-flex items-center gap-2 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
        <UserRoundIcon aria-hidden className="size-3.5" />
        Account settings
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">
        My profile.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Update your name and profile photo. Your email and access role are
        managed securely and cannot be changed here.
      </p>

      <ProfileForm
        name={session.user.name}
        email={session.user.email}
        image={session.user.image ?? ""}
      />
    </main>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse" aria-hidden>
      <div className="h-3 w-36 rounded-full bg-muted" />
      <div className="mt-4 h-10 w-64 rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
      <div className="mt-8 h-72 rounded-2xl bg-muted/60" />
    </div>
  )
}
