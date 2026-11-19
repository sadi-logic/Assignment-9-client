"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { AuthField } from "@/components/auth/auth-field"
import { AuthModeSwitch } from "@/components/auth/auth-mode-switch"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { PasswordChecklist } from "@/components/auth/password-checklist"
import { PasswordInput } from "@/components/auth/password-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { authClient } from "@/lib/auth-client"
import { dashboardForRole, routes, safeReturnPath, signInHref } from "@/lib/site"
import {
  PASSWORD_POLICY_MESSAGE,
  isStrongPassword,
  isValidEmail,
  isValidImageUrl,
  normalizeEmail,
} from "@/lib/validation"

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  image?: string
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || ""
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "SB"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Carried over from /sign-in?next=... so a new customer still lands on the
  // service they were trying to book.
  const nextPath = safeReturnPath(searchParams.get("next"))
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [image, setImage] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const previewImage = isValidImageUrl(image) ? image.trim() : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors: FieldErrors = {}

    if (name.trim().length < 2) {
      nextErrors.name = "Enter your full name."
    }
    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address."
    }
    if (!isStrongPassword(password)) {
      nextErrors.password = PASSWORD_POLICY_MESSAGE
    }
    if (!image.trim()) {
      nextErrors.image = "Add a link to a photo of yourself."
    } else if (!isValidImageUrl(image)) {
      nextErrors.image =
        "Use a full image URL starting with http:// or https://."
    }

    setErrors(nextErrors)
    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.image
    ) {
      return
    }

    setIsSubmitting(true)

    try {
      // Only customer-facing fields are sent. `role` and `isBlocked` are
      // server-controlled (input: false), so they can never be set here.
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: normalizeEmail(email),
        password,
        image: image.trim(),
      
      })
       

      if (error) {
        const message = getAuthErrorMessage(
          error,
          "We could not create your account. Please try again."
        )
        setFormError(message)
        toast.error(message)
        return
         
      }

      const firstName = data?.user?.name?.trim().split(/\s+/)[0]

      toast.success(
        firstName
          ? `Welcome to SalonBook, ${firstName}.`
          : "Your SalonBook account is ready."
      )

       router.refresh()
      // Return to the page that asked for an account, if there was one.
      router.replace(nextPath ?? routes.home)

      // router.replace(dashboardForRole(data?.user?.role))
      // router.refresh()
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
          New here
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground sm:text-[2.9rem]">
          Create your <span className="italic">account</span>.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A few details and your first appointment is only a click away.
        </p>
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

        <AuthField id="sign-up-name" label="Full name" error={errors.name}>
          <Input
            id="sign-up-name"
            name="name"
            autoComplete="name"
            placeholder="Ayesha Rahman"
            value={name}
            disabled={isSubmitting}
            onChange={(event) => {
              setName(event.target.value)
              setErrors((current) => ({ ...current, name: undefined }))
            }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "sign-up-name-error" : undefined}
            className="h-11 rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring"
          />
        </AuthField>

        <AuthField id="sign-up-email" label="Email address" error={errors.email}>
          <Input
            id="sign-up-email"
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
            aria-describedby={errors.email ? "sign-up-email-error" : undefined}
            className="h-11 rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring"
          />
        </AuthField>

        <AuthField
          id="sign-up-password"
          label="Password"
          error={errors.password}
          hint={<PasswordChecklist password={password} />}
        >
          <PasswordInput
            id="sign-up-password"
            name="password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setErrors((current) => ({ ...current, password: undefined }))
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={isSubmitting}
            invalid={Boolean(errors.password)}
            describedBy={
              errors.password ? "sign-up-password-error" : undefined
            }
          />
        </AuthField>

        <AuthField
          id="sign-up-image"
          label="Profile photo"
          error={errors.image}
          hint={
            <FieldDescription className="text-xs">
              Paste a direct link to a photo — it appears on your dashboard and
              on appointments.
            </FieldDescription>
          }
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-11 shrink-0 ring-1 ring-brand-gold/40">
              {previewImage ? (
                <AvatarImage src={previewImage} alt="" />
              ) : null}
              <AvatarFallback className="bg-brand-cream font-display text-sm text-brand-plum">
                {getInitials(name, email)}
              </AvatarFallback>
            </Avatar>

            <Input
              id="sign-up-image"
              name="image"
              type="url"
              inputMode="url"
              autoComplete="photo"
              placeholder="https://example.com/photo.jpg"
              value={image}
              disabled={isSubmitting}
              onChange={(event) => {
                setImage(event.target.value)
                setErrors((current) => ({ ...current, image: undefined }))
              }}
              aria-invalid={Boolean(errors.image)}
              aria-describedby={errors.image ? "sign-up-image-error" : undefined}
              className="h-11 rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring"
            />
          </div>
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
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRightIcon />
            </>
          )}
        </Button>

        <FieldSeparator className="my-1 text-[0.6rem] tracking-[0.24em] uppercase">
          or
        </FieldSeparator>

        <GoogleAuthButton enabled={googleEnabled} label="Sign up with Google" />
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={signInHref(nextPath)}
          className="font-medium text-foreground underline decoration-brand-gold/60 underline-offset-4 transition-colors hover:decoration-brand-gold"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
