import Image from "next/image"
import {
  CalendarDaysIcon,
  Clock3Icon,
  CreditCardIcon,
  ReceiptTextIcon,
  ScissorsIcon,
} from "lucide-react"

import { CancelAppointmentDialog } from "@/components/dashboard/customer/appointments/cancel-appointment-dialog"
import { AppointmentDetailsDialog } from "@/components/dashboard/customer/appointments/appointment-details-dialog"
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/customer/appointments/appointment-status-badge"
import { Button } from "@/components/ui/button"
import {
  canCancelAppointment,
  canPayAppointment,
  formatAppointmentDate,
  formatRequestedAt,
  type AppointmentRow,
} from "@/lib/appointments"
import { formatServicePrice } from "@/lib/services"

/**
 * One appointment in the customer's list.
 *
 * The card is a Server Component: it only renders data. The two dialogs are
 * Client Components because they need state and a request.
 */
export function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentRow
}) {
  const price = formatServicePrice(appointment.servicePrice)
  const canCancel = canCancelAppointment(appointment)
  const canPay = canPayAppointment(appointment)
  const paymentNoteId = `payment-note-${appointment.id}`
  const titleId = `appointment-title-${appointment.id}`

  return (
    <article
      aria-labelledby={titleId}
      className="group grid overflow-hidden rounded-3xl border border-border/70 bg-card/70 shadow-sm transition-all duration-300 hover:border-brand-gold/40 hover:shadow-md sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted sm:aspect-auto sm:h-full">
        {appointment.serviceImage ? (
          <Image
            src={appointment.serviceImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 13rem"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full min-h-32 items-center justify-center bg-linear-to-br from-brand-plum to-brand-plum/60 text-brand-cream">
            <ScissorsIcon aria-hidden className="size-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-medium tracking-[0.24em] text-brand-gold uppercase">
              {appointment.serviceCategory}
            </p>
            <h3
              id={titleId}
              className="mt-1 font-display text-2xl leading-tight text-foreground"
            >
              {appointment.serviceName}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Appointment date</dt>
            <CalendarDaysIcon aria-hidden className="size-3.5 text-brand-gold" />
            <dd>{formatAppointmentDate(appointment.appointmentDate)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Appointment time</dt>
            <Clock3Icon aria-hidden className="size-3.5 text-brand-gold" />
            <dd>{appointment.timeSlot || "—"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Price</dt>
            <ReceiptTextIcon aria-hidden className="size-3.5 text-brand-gold" />
            <dd className="font-medium text-brand-plum">{price ?? "—"}</dd>
          </div>
        </dl>

        <p className="text-[0.68rem] text-muted-foreground">
          Requested {formatRequestedAt(appointment.createdAt)}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/70 pt-4">
          <AppointmentDetailsDialog appointment={appointment} />

          {canCancel ? (
            <CancelAppointmentDialog appointment={appointment} />
          ) : null}

          {canPay ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled
                aria-describedby={paymentNoteId}
                className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
              >
                <CreditCardIcon aria-hidden />
                Pay now
              </Button>
              <span
                id={paymentNoteId}
                className="text-[0.65rem] text-muted-foreground"
              >
                Online payment opens soon.
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
