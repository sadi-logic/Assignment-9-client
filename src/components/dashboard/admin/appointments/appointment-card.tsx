import Image from "next/image"
import {
  CalendarDaysIcon,
  Clock3Icon,
  MailIcon,
  MessageSquareIcon,
  ReceiptTextIcon,
  ScissorsIcon,
} from "lucide-react"

import { AdminCancelAppointmentDialog } from "@/components/dashboard/admin/appointments/cancel-appointment-dialog"
import { AdminAppointmentDetailsDialog } from "@/components/dashboard/admin/appointments/appointment-details-dialog"
import { ConfirmAppointmentDialog } from "@/components/dashboard/admin/appointments/confirm-appointment-dialog"
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/appointments/appointment-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  canAdminCancelAppointment,
  canConfirmAppointment,
  formatAppointmentDate,
  formatRequestedAt,
  type AdminAppointmentRow,
} from "@/lib/appointments"
import { formatServicePrice } from "@/lib/services"

/** "Ava Customer" → "AC". Falls back to the email's first letters. */
function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim()
  if (!source) return "?"

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

/**
 * One appointment in the admin queue.
 *
 * The card is a Server Component: it only renders data. The dialogs are Client
 * Components because they need state and a request. Payment status is shown
 * but never offered as an action.
 */
export function AdminAppointmentCard({
  appointment,
}: {
  appointment: AdminAppointmentRow
}) {
  const price = formatServicePrice(appointment.servicePrice)
  const canConfirm = canConfirmAppointment(appointment)
  const canCancel = canAdminCancelAppointment(appointment)
  const titleId = `admin-appointment-title-${appointment.id}`

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

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
          <Avatar className="size-9 shrink-0">
            {appointment.customerImage ? (
              <AvatarImage src={appointment.customerImage} alt="" />
            ) : null}
            <AvatarFallback className="bg-brand-plum text-[0.65rem] text-brand-cream">
              {getInitials(appointment.customerName, appointment.customerEmail)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {appointment.customerName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MailIcon aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{appointment.customerEmail}</span>
            </p>
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

        {appointment.message ? (
          <p className="flex gap-2 rounded-xl border border-brand-gold/25 bg-brand-gold/5 px-3 py-2 text-sm leading-relaxed text-foreground/75">
            <MessageSquareIcon
              aria-hidden
              className="mt-0.5 size-3.5 shrink-0 text-brand-gold"
            />
            <span className="line-clamp-2">{appointment.message}</span>
          </p>
        ) : null}

        <p className="text-[0.68rem] text-muted-foreground">
          Requested {formatRequestedAt(appointment.createdAt)}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          <AdminAppointmentDetailsDialog appointment={appointment} />

          {canConfirm ? (
            <ConfirmAppointmentDialog appointment={appointment} />
          ) : null}

          {canCancel ? (
            <AdminCancelAppointmentDialog appointment={appointment} />
          ) : null}
        </div>
      </div>
    </article>
  )
}
