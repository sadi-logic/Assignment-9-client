import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardForRole, routes } from "@/lib/site"

export default function DashboardIndexPage() {
  return (
    <Suspense fallback={null}>
      <RedirectToRoleDashboard />
    </Suspense>
  )
}

async function RedirectToRoleDashboard() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect(routes.signIn)
  if (session.user.isBlocked) redirect(routes.home)

  redirect(dashboardForRole(session.user.role))
  return null
}
