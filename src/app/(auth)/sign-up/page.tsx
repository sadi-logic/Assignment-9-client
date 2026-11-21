import { Suspense } from "react"
import type { Metadata } from "next"

import { SignUpForm } from "@/components/auth/sign-up-form"
import { isGoogleAuthEnabled } from "@/lib/env"

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your SalonBook account to book salon appointments and pay securely online.",
}


export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <SignUpForm googleEnabled={isGoogleAuthEnabled()} />
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
      <div className="mt-7 h-40 rounded-xl bg-muted/50" />
    </div>
  )
}
