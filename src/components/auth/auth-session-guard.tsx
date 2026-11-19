"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { dashboardForRole, safeReturnPath } from "@/lib/site"
import { BLOCKED_ACCOUNT_MESSAGE } from "@/lib/validation"

/**
 * Keeps signed-in users away from the auth pages and sends them to the
 * dashboard that matches their verified role.
 */
export function AuthSessionGuard() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (isPending || !session || handled.current) return
    handled.current = true

    if (session.user.isBlocked) {
      toast.error(BLOCKED_ACCOUNT_MESSAGE)
      void authClient.signOut()
      return
    }

    // A protected page can ask us to come back after signing in. Reading the
    // URL here (instead of useSearchParams) keeps the guard free of another
    // Suspense requirement.
    const nextPath = safeReturnPath(
      new URLSearchParams(window.location.search).get("next")
    )

    router.replace(nextPath ?? dashboardForRole(session.user.role))
  }, [isPending, session, router])

  return null
}
