import {
  BadgeCheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  Clock3Icon,
  WalletIcon,
} from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import {
  APPOINTMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type AppointmentStatus,
  type PaymentStatus,
} from "@/lib/appointments"

/**
 * Status is shown three ways: colour, an icon and a word. Customers should not
 * have to tell gold from plum to know whether a request is still pending.
 *
 * The class strings are complete literals (not built from variables) so
 * Tailwind can see them.
 */
const statusStyles: Record<AppointmentStatus, string> = {
  pending: "border-brand-gold/45 bg-brand-gold/10 text-brand-plum",
  confirmed: "border-brand-plum/25 bg-brand-plum/10 text-brand-plum",
  cancelled: "border-border bg-muted text-muted-foreground",
}

const statusIcons = {
  pending: Clock3Icon,
  confirmed: CircleCheckIcon,
  cancelled: CircleXIcon,
} as const

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus
}) {
  const Icon = statusIcons[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 px-2.5 text-[0.6rem] font-medium tracking-[0.14em] uppercase",
        statusStyles[status]
      )}
    >
      <Icon aria-hidden />
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "border-border bg-background text-muted-foreground",
  paid: "border-emerald-600/25 bg-emerald-600/10 text-emerald-700",
}

const paymentIcons = {
  unpaid: WalletIcon,
  paid: BadgeCheckIcon,
} as const

export function PaymentStatusBadge({
  paymentStatus,
}: {
  paymentStatus: PaymentStatus
}) {
  const Icon = paymentIcons[paymentStatus]

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 px-2.5 text-[0.6rem] font-medium tracking-[0.14em] uppercase",
        paymentStyles[paymentStatus]
      )}
    >
      <Icon aria-hidden />
      {PAYMENT_STATUS_LABELS[paymentStatus]}
    </Badge>
  )
}
