"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleCheckIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  formatAppointmentDate,
  type AdminAppointmentRow,
} from "@/lib/appointments"
import { routes, signInHref } from "@/lib/site"

/**
 * Confirms a pending appointment.
 *
 * The dialog only asks *when*; the rule "pending only" is enforced by the Next
 * route and again, atomically, inside Express.
 */
export function ConfirmAppointmentDialog({
  appointment,
}: {
  appointment: AdminAppointmentRow
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  async function handleConfirm() {
    setIsConfirming(true)

    try {
      const response = await fetch(
        `/api/admin/appointments/${appointment.id}/confirm`,
        { method: "PATCH" }
      )
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (response.status === 401) {
        toast.error(payload?.error ?? "Please sign in again.")
        router.push(signInHref(routes.adminAppointments))
        return
      }

      if (!response.ok) {
        toast.error(
          payload?.error ??
            "The appointment could not be confirmed. Please try again."
        )

        // A 409 means someone else already changed it, so the list is stale.
        if (response.status === 409) {
          setOpen(false)
          router.refresh()
        }
        return
      }

      toast.success("Appointment confirmed.")
      setOpen(false)
      // Ask the server component for the fresh list instead of guessing.
      router.refresh()
    } catch {
      toast.error(
        "The appointment service could not be reached. Please try again."
      )
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        <CircleCheckIcon aria-hidden />
        Confirm
      </Button>

      <AlertDialog open={open} onOpenChange={(next) => setOpen(next)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-brand-plum/10 text-brand-plum">
              <CircleCheckIcon aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-display text-xl">
              Confirm this appointment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {appointment.serviceName} for {appointment.customerName} on{" "}
              {formatAppointmentDate(appointment.appointmentDate)} at{" "}
              {appointment.timeSlot}. The customer will see it as confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              Keep as pending
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2Icon aria-hidden className="animate-spin" />
                  Confirming…
                </>
              ) : (
                "Confirm appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
