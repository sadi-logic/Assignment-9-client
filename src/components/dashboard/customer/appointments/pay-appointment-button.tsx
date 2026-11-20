import Link from "next/link"
import { CreditCardIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { appointmentCheckoutPath } from "@/lib/site"

export function PayAppointmentButton({
  appointmentId,
}: {
  appointmentId: string
}) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={appointmentCheckoutPath(appointmentId)} />}
      size="sm"
      className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
    >
      <CreditCardIcon aria-hidden />
      Pay now
    </Button>
  )
}
