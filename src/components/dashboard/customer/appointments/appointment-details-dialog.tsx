"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import {
  CalendarDaysIcon,
  Clock3Icon,
  MessageSquareIcon,
  ReceiptTextIcon,
  ScissorsIcon,
} from "lucide-react"

import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/customer/appointments/appointment-status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatAppointmentDate,
  formatRequestedAt,
  type AppointmentRow,
} from "@/lib/appointments"
import { formatServicePrice } from "@/lib/services"

/**
 * Read-only details for one appointment. It only receives the row the customer
 * already owns, so it cannot reveal anybody else's information.
 */
export function AppointmentDetailsDialog({
  appointment,
}: {
  appointment: AppointmentRow
}) {
  const [open, setOpen] = useState(false)
  const price = formatServicePrice(appointment.servicePrice)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        View details
      </Button>

      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <p className="text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
              Appointment details
            </p>
            <DialogTitle className="font-display text-2xl leading-tight">
              {appointment.serviceName}
            </DialogTitle>
            <DialogDescription>{appointment.serviceCategory}</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border/70 bg-muted">
            {appointment.serviceImage ? (
              <Image
                src={appointment.serviceImage}
                alt={appointment.serviceName}
                fill
                sizes="(max-width: 640px) 92vw, 30rem"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-plum to-brand-plum/60 text-brand-cream">
                <ScissorsIcon aria-hidden className="size-8" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-muted/40 p-3.5">
            <Detail
              icon={<CalendarDaysIcon aria-hidden className="size-3.5" />}
              label="Date"
              value={formatAppointmentDate(appointment.appointmentDate)}
            />
            <Detail
              icon={<Clock3Icon aria-hidden className="size-3.5" />}
              label="Time"
              value={appointment.timeSlot || "—"}
            />
            <Detail
              icon={<ReceiptTextIcon aria-hidden className="size-3.5" />}
              label="Price at booking"
              value={price ?? "—"}
            />
            <Detail
              icon={<CalendarDaysIcon aria-hidden className="size-3.5" />}
              label="Requested"
              value={formatRequestedAt(appointment.createdAt)}
            />
          </dl>

          {appointment.serviceDescription ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {appointment.serviceDescription}
            </p>
          ) : null}

          {appointment.message ? (
            <div className="rounded-xl border border-brand-gold/35 bg-brand-gold/10 px-3.5 py-3">
              <p className="flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.22em] text-brand-plum uppercase">
                <MessageSquareIcon aria-hidden className="size-3.5" />
                Your note
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                {appointment.message}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[0.5rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        <span className="text-brand-gold">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm text-foreground">{value}</dd>
    </div>
  )
}
