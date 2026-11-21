"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"


export function useSignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    const { error } = await authClient.signOut()

    if (error) {
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
