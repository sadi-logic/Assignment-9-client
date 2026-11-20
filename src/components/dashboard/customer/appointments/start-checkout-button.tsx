"use client"

import { useState } from "react"
import { CreditCardIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function StartCheckoutButton({
  appointmentId,
}: {
  appointmentId: string
}) {
  const [isStarting, setIsStarting] = useState(false)

  async function startCheckout() {
    if (isStarting) return
    setIsStarting(true)

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      })
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null

      if (!response.ok || !payload?.url) {
        toast.error(payload?.error ?? "Checkout could not be started.")
        return
      }

      window.location.assign(payload.url)
    } catch {
      toast.error("The payment service could not be reached. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => void startCheckout()}
      disabled={isStarting}
      className="h-11 w-full rounded-full text-[0.65rem] tracking-[0.16em] uppercase"
    >
      {isStarting ? (
        <>
          <Loader2Icon aria-hidden className="animate-spin" />
          Preparing secure payment…
        </>
      ) : (
        <>
          <CreditCardIcon aria-hidden />
          Continue to secure payment
        </>
      )}
    </Button>
  )
}
