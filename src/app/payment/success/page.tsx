import Link from "next/link"
import type { Metadata } from "next"
import { CircleCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Payment submitted",
  description: "Your Stripe payment is being confirmed.",
}

export default function PaymentSuccessPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-border/70 bg-card/60 px-6 py-12 text-center sm:px-10">
        <CircleCheckIcon
          aria-hidden
          className="mx-auto size-9 text-brand-plum"
        />
        <p className="mt-5 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
          Payment submitted
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
          Thank you.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Stripe has returned you to SalonBook. Your appointment will show as
          paid after our verified payment notification is received.
        </p>
        <Button
          nativeButton={false}
          render={<Link href={routes.customerAppointments} />}
          className="mt-6 h-10 rounded-full px-5 text-[0.65rem] tracking-[0.16em] uppercase"
        >
          View my appointments
        </Button>
      </section>
    </main>
  )
}
