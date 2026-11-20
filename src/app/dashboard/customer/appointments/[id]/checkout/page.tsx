import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ArrowLeftIcon, CalendarDaysIcon, Clock3Icon, ReceiptTextIcon } from "lucide-react"

import { StartCheckoutButton } from "@/components/dashboard/customer/appointments/start-checkout-button"
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/appointments/appointment-status-badge"
import { Button } from "@/components/ui/button"
import {
  canPayAppointment,
  formatAppointmentDate,
  parseAppointmentList,
  type AppointmentRow,
} from "@/lib/appointments"
import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import { dashboardForRole, routes, signInHref } from "@/lib/site"
import { formatServicePrice, parseServiceList } from "@/lib/services"

export const metadata: Metadata = {
  title: "Review appointment payment",
  description: "Review your appointment and price before opening Stripe Checkout.",
}

export default function AppointmentCheckoutPage(
  props: PageProps<"/dashboard/customer/appointments/[id]/checkout">
) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent params={props.params} />
      </Suspense>
    </main>
  )
}

async function CheckoutContent({
  params,
}: Pick<PageProps<"/dashboard/customer/appointments/[id]/checkout">, "params">) {
  const { id } = await params
  if (!/^[a-f\d]{24}$/i.test(id)) notFound()

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) {
    redirect(signInHref(`${routes.customerAppointments}/${id}/checkout`))
  }
  if (session.user.role !== "customer") {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  let appointment: AppointmentRow | null = null
  let error: string | null = null

  try {
    const [appointmentsResponse, servicesResponse] = await Promise.all([
      backendFetch("/appointments", {
        method: "GET",
        headers: { cookie: requestHeaders.get("cookie") ?? "" },
      }),
      backendFetch("/services", { method: "GET" }),
    ])

    if (!appointmentsResponse.ok) {
      error = `The appointments API answered with status ${appointmentsResponse.status}.`
    } else if (!servicesResponse.ok) {
      error = `The services API answered with status ${servicesResponse.status}.`
    } else {
      const [appointmentsPayload, servicesPayload]: [unknown, unknown] =
        await Promise.all([
          appointmentsResponse.json(),
          servicesResponse.json(),
        ])

      if (!Array.isArray(appointmentsPayload) || !Array.isArray(servicesPayload)) {
        error = "An API returned an unexpected response."
      } else {
        appointment =
          parseAppointmentList(
            appointmentsPayload,
            parseServiceList(servicesPayload)
          ).find((item) => item.id === id) ?? null
      }
    }
  } catch (requestError) {
    error =
      requestError instanceof Error && requestError.message
        ? requestError.message
        : BACKEND_UNAVAILABLE_MESSAGE
  }

  if (error) return <CheckoutError message={error} />
  if (!appointment) notFound()

  const canPay = canPayAppointment(appointment)
  const price = formatServicePrice(appointment.servicePrice)

  return (
    <section className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={routes.customerAppointments} />}
        className="-ml-3 rounded-full text-muted-foreground"
      >
        <ArrowLeftIcon aria-hidden />
        My appointments
      </Button>

      <header className="mt-5">
        <p className="text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
          Review your booking
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Appointment checkout.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Confirm the appointment and price below, then continue to Stripe’s
          secure payment page.
        </p>
      </header>

      <article className="mt-7 overflow-hidden rounded-3xl border border-border/70 bg-card/70 shadow-sm">
        <div className="grid sm:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="relative aspect-4/3 overflow-hidden bg-muted sm:aspect-auto sm:min-h-56">
            {appointment.serviceImage ? (
              <Image
                src={appointment.serviceImage}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 12rem"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full min-h-40 items-center justify-center bg-linear-to-br from-brand-plum to-brand-plum/60 text-brand-cream">
                <ReceiptTextIcon aria-hidden className="size-8" />
              </div>
            )}
          </div>

          <div className="min-w-0 p-5 sm:p-6">
            <p className="text-[0.55rem] font-medium tracking-[0.24em] text-brand-gold uppercase">
              {appointment.serviceCategory}
            </p>
            <h2 className="mt-1 font-display text-2xl text-foreground">
              {appointment.serviceName}
            </h2>

            <dl className="mt-5 grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon aria-hidden className="size-4 text-brand-gold" />
                <dt className="sr-only">Appointment date</dt>
                <dd>{formatAppointmentDate(appointment.appointmentDate)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock3Icon aria-hidden className="size-4 text-brand-gold" />
                <dt className="sr-only">Appointment time</dt>
                <dd>{appointment.timeSlot}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <AppointmentStatusBadge status={appointment.status} />
              <PaymentStatusBadge paymentStatus={appointment.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/50 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Appointment total</p>
            <p className="font-display text-3xl text-brand-plum">
              {price ?? "Price unavailable"}
            </p>
          </div>

          {canPay ? (
            <div className="mt-5">
              <StartCheckoutButton appointmentId={appointment.id} />
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                The final amount is checked against your saved appointment on
                the server. Card details are entered on Stripe, not on this site.
              </p>
            </div>
          ) : (
            <p
              role="status"
              className="mt-5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              This appointment is not currently eligible for payment. Only
              confirmed, unpaid appointments can be paid.
            </p>
          )}
        </div>
      </article>
    </section>
  )
}

function CheckoutError({ message }: { message: string }) {
  return (
    <section
      role="alert"
      className="mx-auto mt-10 max-w-xl rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <h1 className="font-display text-3xl text-foreground">
        We couldn’t load this appointment.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={routes.customerAppointments} />}
        className="mt-6 rounded-full"
      >
        Back to my appointments
      </Button>
    </section>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse" aria-hidden>
      <div className="h-9 w-36 rounded-full bg-muted" />
      <div className="mt-7 h-3 w-40 rounded-full bg-muted" />
      <div className="mt-3 h-10 w-full max-w-lg rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
      <div className="mt-7 h-80 rounded-3xl bg-muted/60" />
    </div>
  )
}
