import type { Metadata } from "next"

import { SignUpForm } from "@/components/auth/sign-up-form"
import { isGoogleAuthEnabled } from "@/lib/env"

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your SalonBook account to book salon appointments and pay securely online.",
}

export default function SignUpPage() {
  return <SignUpForm googleEnabled={isGoogleAuthEnabled()} />
}
