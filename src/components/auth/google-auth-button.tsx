"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/site"

type GoogleAuthButtonProps = {
  enabled: boolean
  label: string
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.22 7.22 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.09C6.23 6.87 8.88 4.76 12 4.76Z"
      />
    </svg>
  )
}

export function GoogleAuthButton({ enabled, label }: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handleGoogleAuth() {
    setIsRedirecting(true)

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        // The auth page guard sends the user to the dashboard that matches
        // the role Better Auth returns.
        callbackURL: routes.signIn,
        errorCallbackURL: routes.signIn,
      })

      if (error) {
        toast.error(
          getAuthErrorMessage(error, "Google sign-in could not be started.")
        )
        setIsRedirecting(false)
      }
      // On success Better Auth redirects the browser to Google.
    } catch {
      toast.error("Google sign-in could not be started. Please try again.")
      setIsRedirecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleAuth}
        disabled={!enabled || isRedirecting}
        aria-describedby={enabled ? undefined : "google-availability"}
        className="h-11 w-full rounded-full border-border/80 bg-background/60 text-[0.72rem] font-medium tracking-[0.12em] uppercase focus-visible:ring-ring"
      >
        {isRedirecting ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <GoogleMark />
        )}
        {isRedirecting ? "Connecting…" : label}
      </Button>

      {!enabled ? (
        <p
          id="google-availability"
          className="text-center text-xs text-muted-foreground"
        >
          Google sign-in is not configured for this environment yet.
        </p>
      ) : null}
    </div>
  )
}
