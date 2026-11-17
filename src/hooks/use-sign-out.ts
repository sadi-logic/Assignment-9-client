"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"

/**
 * Shared sign-out behaviour for the desktop dropdown and the mobile menu.
 * The Better Auth session store updates instantly, so the navbar re-renders
 * into its public state as soon as this resolves.
 */
export function useSignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    const { error } = await authClient.signOut()

    if (error) {
      // Nothing to roll back: the stored session was not cleared.
      setIsSigningOut(false)
      return { error }
    }

    router.replace("/")
    router.refresh()
    setIsSigningOut(false)
    return { error: null }
  }

  return { signOut, isSigningOut }
}
