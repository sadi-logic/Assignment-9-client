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
  type AdminAppointmentRow,
} from "@/lib/appointments"
import { routes, signInHref } from "@/lib/site"

/**
 * Cancels a pending or confirmed appointment.
 *
 * Express allows exactly those two starting statuses and rejects anything
 * else, so a stale browser tab cannot cancel twice.
 */
export function AdminCancelAppointmentDialog({
  appointment,
}: {
  appointment: AdminAppointmentRow
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  async function handleCancel() {
    setIsCancelling(true)

    try {
      const response = await fetch(
        `/api/admin/appointments/${appointment.id}/cancel`,
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
            "The appointment could not be cancelled. Please try again."
        )

        if (response.status === 409) {
          setOpen(false)
          router.refresh()
        }
        return
      }

      toast.success("Appointment cancelled. The customer will see it as cancelled.")
      setOpen(false)
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
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 rounded-full border-destructive/30 px-4 text-[0.6rem] tracking-[0.16em] text-destructive uppercase hover:bg-destructive/10 hover:text-destructive"
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
              {appointment.serviceName} for {appointment.customerName} on{" "}
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
