import Link from "next/link"
import type { Metadata } from "next"
import { CircleXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Payment not completed",
  description: "Your appointment payment was not completed.",
}

export default function PaymentCancelPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-border/70 bg-card/60 px-6 py-12 text-center sm:px-10">
        <CircleXIcon
          aria-hidden
          className="mx-auto size-9 text-destructive"
        />
        <p className="mt-5 text-[0.6rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Payment not completed
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
          Your payment was unsuccessful.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Stripe did not confirm a successful payment for this attempt, so
          SalonBook has not marked your appointment as paid. Return to your
          appointments to try again with another payment method or card.
        </p>
        <Button
          nativeButton={false}
          render={<Link href={routes.customerAppointments} />}
          className="mt-6 h-10 rounded-full px-5 text-[0.65rem] tracking-[0.16em] uppercase"
        >
          Return to appointments
        </Button>
      </section>
    </main>
  )
}
