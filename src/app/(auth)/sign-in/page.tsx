import { Suspense } from "react"
import type { Metadata } from "next"

import { SignInForm } from "@/components/auth/sign-in-form"
import { isGoogleAuthEnabled } from "@/lib/env"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to SalonBook to manage your appointments and payments.",
}

/**
 * The form reads the `next` query parameter with `useSearchParams`, which is
 * dynamic data — the Suspense boundary lets the auth shell prerender while the
 * form hydrates.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <SignInForm googleEnabled={isGoogleAuthEnabled()} />
    </Suspense>
  )
}

function AuthFormFallback() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-11 rounded-full bg-muted/60" />
      <div className="mt-7 h-3 w-24 rounded-full bg-muted" />
      <div className="mt-4 h-10 w-3/4 rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-full rounded-full bg-muted" />
      <div className="mt-7 h-32 rounded-xl bg-muted/50" />
    </div>
  )
}
