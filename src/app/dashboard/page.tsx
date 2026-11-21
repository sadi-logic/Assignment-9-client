import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getAuthSession } from "@/lib/auth"
import { dashboardForRole, routes } from "@/lib/site"

export default function DashboardIndexPage() {
  return (
    <Suspense fallback={null}>
      <RedirectToRoleDashboard />
    </Suspense>
  )
}

async function RedirectToRoleDashboard() {
  const session = await getAuthSession(await headers())

  if (!session?.user) redirect(routes.signIn)
  if (session.user.isBlocked) redirect(routes.home)

  redirect(dashboardForRole(session.user.role))
  return null
}
