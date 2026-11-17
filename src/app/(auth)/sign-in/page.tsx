import type { Metadata } from "next"

import { SignInForm } from "@/components/auth/sign-in-form"
import { isGoogleAuthEnabled } from "@/lib/env"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to SalonBook to manage your appointments and payments.",
}

export default function SignInPage() {
  return <SignInForm googleEnabled={isGoogleAuthEnabled()} />
}
