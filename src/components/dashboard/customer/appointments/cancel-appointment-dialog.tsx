"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BanIcon, Loader2Icon } from "lucide-react"
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
  type AppointmentRow,
} from "@/lib/appointments"
import { routes, signInHref } from "@/lib/site"

/**
 * Confirmation before cancelling a pending appointment.
 *
 * The dialog only decides *when* to ask; it does not decide whether cancelling
 * is allowed. `/api/appointments/[id]/cancel` verifies the session, and Express
 * checks ownership and the `pending` status again.
 */
export function CancelAppointmentDialog({
  appointment,
}: {
  appointment: AppointmentRow
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  async function handleCancel() {
    setIsCancelling(true)

    try {
      const response = await fetch(
        `/api/appointments/${appointment.id}/cancel`,
        { method: "PATCH" }
      )
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (response.status === 401) {
        toast.error(payload?.error ?? "Please sign in again.")
        router.push(signInHref(routes.customerAppointments))
        return
      }

      if (!response.ok) {
        toast.error(
          payload?.error ??
            "The appointment could not be cancelled. Please try again."
        )
        return
      }

      toast.success("Appointment cancelled. The time slot is free again.")
      setOpen(false)
      // Ask the server component for the fresh list instead of guessing the new
      // state in the browser.
      router.refresh()
    } catch {
      toast.error(
        "The appointment service could not be reached. Please try again."
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        Cancel
      </Button>

      <AlertDialog open={open} onOpenChange={(next) => setOpen(next)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <BanIcon aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-display text-xl">
              Cancel this appointment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {appointment.serviceName} on{" "}
              {formatAppointmentDate(appointment.appointmentDate)} at{" "}
              {appointment.timeSlot}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep appointment
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2Icon aria-hidden className="animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Cancel appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
