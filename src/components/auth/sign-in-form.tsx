"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { AuthField } from "@/components/auth/auth-field"
import { AuthModeSwitch } from "@/components/auth/auth-mode-switch"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { authClient } from "@/lib/auth-client"
import { dashboardForRole, safeReturnPath, signUpHref } from "@/lib/site"
import {
  BLOCKED_ACCOUNT_MESSAGE,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validation"

type FieldErrors = {
  email?: string
  password?: string
}

export function SignInForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Set by the Service Details page, e.g. /sign-in?next=%2Fservices%2Fabc123
  const nextPath = safeReturnPath(searchParams.get("next"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors: FieldErrors = {}

    if (!isValidEmail(email)) {
      nextErrors.email = "Enter the email address you registered with."
    }
    if (!password) {
      nextErrors.password = "Enter your password."
    }

    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: normalizeEmail(email),
        password,
        rememberMe: true,
      })

      if (error) {
        const message = getAuthErrorMessage(
          error,
          "We could not sign you in. Please try again."
        )
        setFormError(message)
        toast.error(message)
        return
      }

      // Defence in depth: blocked accounts are also refused by the server
      // when it creates the session.
      if (data?.user?.isBlocked) {
        await authClient.signOut()
        setFormError(BLOCKED_ACCOUNT_MESSAGE)
        toast.error(BLOCKED_ACCOUNT_MESSAGE)
        return
      }

      const firstName = data?.user?.name?.trim().split(/\s+/)[0]

      toast.success(
        firstName ? `Welcome back, ${firstName}.` : "Welcome back to SalonBook."
      )

       router.refresh()
      // Go back to the page that required sign-in (a protected service, for
       // example); otherwise open the correct role dashboard.
       router.replace(nextPath ?? dashboardForRole(data?.user?.role))
    } catch {
      const message =
        "We could not reach the server. Check your connection and try again."
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in duration-300 fade-in-0 slide-in-from-bottom-2">
      <AuthModeSwitch />

      <header className="mt-7">
        <p className="text-[0.6rem] tracking-[0.34em] text-brand-gold uppercase">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground sm:text-[2.9rem]">
          Sign in to <span className="italic">SalonBook</span>.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your appointments, confirmations and payments — all in one calm place.
        </p>

        {nextPath ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/35 bg-brand-gold/10 px-3 py-1.5 text-[0.55rem] font-medium tracking-[0.16em] text-brand-plum uppercase">
            <ArrowRightIcon aria-hidden className="size-3" />
            You’ll return to your service afterwards
          </p>
        ) : null}
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4.5">
        {formError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-sm leading-relaxed text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <AuthField id="sign-in-email" label="Email address" error={errors.email}>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            disabled={isSubmitting}
            onChange={(event) => {
              setEmail(event.target.value)
              setErrors((current) => ({ ...current, email: undefined }))
            }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "sign-in-email-error" : undefined}
            className="h-11 rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring"
          />
        </AuthField>

        <AuthField
          id="sign-in-password"
          label="Password"
          error={errors.password}
        >
          <PasswordInput
            id="sign-in-password"
            name="password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setErrors((current) => ({ ...current, password: undefined }))
            }}
            placeholder="Your password"
            autoComplete="current-password"
            disabled={isSubmitting}
            invalid={Boolean(errors.password)}
            describedBy={
              errors.password ? "sign-in-password-error" : undefined
            }
          />
        </AuthField>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-1 h-11 w-full rounded-full text-[0.7rem] tracking-[0.18em] uppercase focus-visible:ring-ring"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRightIcon />
            </>
          )}
        </Button>

        <FieldSeparator className="my-1 text-[0.6rem] tracking-[0.24em] uppercase">
          or
        </FieldSeparator>

        <GoogleAuthButton enabled={googleEnabled} label="Continue with Google" />
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to SalonBook?{" "}
        <Link
          href={signUpHref(nextPath)}
          className="font-medium text-foreground underline decoration-brand-gold/60 underline-offset-4 transition-colors hover:decoration-brand-gold"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
