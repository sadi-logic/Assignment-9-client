import { Suspense, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  CircleCheckIcon,
  CircleXIcon,
  Clock3Icon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react"

import { AppointmentCard } from "@/components/dashboard/customer/appointments/appointment-card"
import { Button } from "@/components/ui/button"
import {
  countAppointments,
  parseAppointmentList,
  type AppointmentRow,
} from "@/lib/appointments"
import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import { parseServiceList } from "@/lib/services"
import { dashboardForRole, routes, signInHref } from "@/lib/site"

export const metadata: Metadata = {
  title: "My Appointments",
  description:
    "Review every SalonBook appointment request, check its status and manage your bookings.",
}

/**
 * Customer-only page.
 *
 * The session is read on the server first, then the appointments are fetched
 * with the verified user id. The browser never receives another customer's
 * list, and it never decides who the customer is.
 */
export default function MyAppointmentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<AppointmentsSkeleton />}>
        <AppointmentsContent />
      </Suspense>
    </div>
  )
}

async function AppointmentsContent() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect(signInHref(routes.customerAppointments))
  }

  // Admins have their own dashboard; they must not see a customer's bookings.
  if (session.user.role !== "customer") {
    redirect(dashboardForRole(session.user.role))
  }

  const { appointments, error } = await getCustomerAppointments(session.user.id)
  const counts = countAppointments(appointments)

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
            <SparklesIcon aria-hidden className="size-3.5" />
            Your appointment book
          </p>
          <h1 className="mt-2 font-display text-4xl leading-none text-foreground sm:text-5xl">
            My appointments<span className="text-brand-gold">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every request you have sent, from the first pending note to the
            final confirmed visit.
          </p>
        </div>

        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.services} />}
          className="h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          Explore services
        </Button>
      </header>

      {error ? (
        <LoadError message={error} />
      ) : appointments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Two columns until large screens: four columns at tablet width made
              the "Confirmed"/"Cancelled" labels too narrow. */}
          <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              label="Total"
              value={counts.total}
              icon={<CalendarDaysIcon aria-hidden className="size-4" />}
            />
            <SummaryCard
              label="Pending"
              value={counts.pending}
              icon={<Clock3Icon aria-hidden className="size-4" />}
              tone="text-brand-gold"
            />
            <SummaryCard
              label="Confirmed"
              value={counts.confirmed}
              icon={<CircleCheckIcon aria-hidden className="size-4" />}
              tone="text-brand-plum"
            />
            <SummaryCard
              label="Cancelled"
              value={counts.cancelled}
              icon={<CircleXIcon aria-hidden className="size-4" />}
              tone="text-muted-foreground"
            />
          </dl>

          <section aria-labelledby="appointments-list-heading" className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
              <h2
                id="appointments-list-heading"
                className="font-display text-2xl leading-none text-foreground"
              >
                Your bookings
              </h2>
              <p className="text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                {counts.total === 1 ? "1 appointment" : `${counts.total} appointments`}
              </p>
            </div>

            <ul role="list" className="mt-5 grid gap-4">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}

/**
 * Reads the appointments and the service menu in parallel, then joins them.
 * Any failure becomes a readable message — never a made-up appointment.
 */
async function getCustomerAppointments(
  customerId: string
): Promise<{ appointments: AppointmentRow[]; error: string | null }> {
  try {
    const [appointmentsResponse, servicesResponse] = await Promise.all([
      backendFetch(
        `/appointments?customerId=${encodeURIComponent(customerId)}`,
        { method: "GET" }
      ),
      backendFetch("/services", { method: "GET" }),
    ])

    if (!appointmentsResponse.ok) {
      return {
        appointments: [],
        error: `The appointments API answered with status ${appointmentsResponse.status}.`,
      }
    }

    if (!servicesResponse.ok) {
      return {
        appointments: [],
        error: `The services API answered with status ${servicesResponse.status}.`,
      }
    }

    const appointmentsPayload: unknown = await appointmentsResponse.json()
    const servicesPayload: unknown = await servicesResponse.json()

    if (!Array.isArray(appointmentsPayload)) {
      return {
        appointments: [],
        error: "The appointments API returned an unexpected response.",
      }
    }

    return {
      appointments: parseAppointmentList(
        appointmentsPayload,
        parseServiceList(servicesPayload)
      ),
      error: null,
    }
  } catch (error) {
    return {
      appointments: [],
      error:
        error instanceof Error && error.message
          ? error.message
          : BACKEND_UNAVAILABLE_MESSAGE,
    }
  }
}

function SummaryCard({
  label,
  value,
  icon,
  tone = "text-brand-plum",
}: {
  label: string
  value: number
  icon: ReactNode
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
      <dt className="flex items-center justify-between gap-2 text-[0.55rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {label}
        <span className={tone}>{icon}</span>
      </dt>
      <dd className="mt-1.5 font-display text-2xl leading-none text-foreground">
        {value}
      </dd>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-3xl border border-border/70 bg-card/60 px-6 py-14 text-center">
      <CalendarCheckIcon aria-hidden className="mx-auto size-7 text-brand-gold" />
      <p className="mt-4 text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
        Nothing booked yet
      </p>
      <h2 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
        Your appointment book is waiting.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Find a treatment that feels like you, choose a time, and send your first
        request. It will appear here as soon as it is saved.
      </p>

      <Button
        nativeButton={false}
        render={<Link href={routes.services} />}
        className="mt-6 h-10 rounded-full px-6 text-[0.65rem] tracking-[0.18em] uppercase"
      >
        Explore services
      </Button>
    </div>
  )
}

function LoadError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-8 rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center"
    >
      <p className="font-display text-2xl text-foreground">
        We couldn’t load your appointments.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* A plain anchor forces a fresh request instead of a cached navigation. */}
        <Button
          nativeButton={false}
          render={<a href={routes.customerAppointments} />}
          className="h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          <RefreshCwIcon aria-hidden />
          Try again
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.services} />}
          className="h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          Browse services
        </Button>
      </div>
    </div>
  )
}

function AppointmentsSkeleton() {
  return (
    <div aria-label="Loading your appointments" aria-busy="true">
      <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-10 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-full max-w-md animate-pulse rounded-full bg-muted" />

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-2xl bg-muted/60"
          />
        ))}
      </div>

      <div className="mt-10 grid gap-4">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-3xl bg-muted/50"
          />
        ))}
      </div>
    </div>
  )
}
