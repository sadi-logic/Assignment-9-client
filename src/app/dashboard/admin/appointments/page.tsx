import { Suspense, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  Clock3Icon,
  RefreshCwIcon,
  ScissorsIcon,
} from "lucide-react"

import { AdminAppointmentCard } from "@/components/dashboard/admin/appointments/appointment-card"
import { Button } from "@/components/ui/button"
import {
  countAppointments,
  parseAdminAppointmentList,
  type AdminAppointmentRow,
} from "@/lib/appointments"
import { getAuthSession } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import { dashboardForRole, routes, signInHref } from "@/lib/site"

export const metadata: Metadata = {
  title: "Manage Appointments",
  description:
    "Review every SalonBook appointment request, confirm pending bookings and cancel when needed.",
}


export default function ManageAppointmentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<AppointmentsSkeleton />}>
        <AdminAppointmentsContent />
      </Suspense>
    </div>
  )
}

async function AdminAppointmentsContent() {
  const requestHeaders = await headers()
  const session = await getAuthSession(requestHeaders)

  if (!session?.user) {
    redirect(signInHref(routes.adminAppointments))
  }

  if (session.user.role !== "admin") {
    redirect(dashboardForRole(session.user.role))
  }

  if (session.user.isBlocked) {
    redirect(routes.home)
  }

  // The session token is forwarded to Express, which looks it up again before
  // returning any appointment data.
  const { appointments, error } = await getAdminAppointments(
    session.session.token
  )
  const counts = countAppointments(appointments)

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase"
      >
        <Link
          href={routes.adminDashboard}
          className="rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dashboard
        </Link>
        <ChevronRightIcon aria-hidden className="size-3 text-border" />
        <span aria-current="page" className="text-foreground/80">
          Appointments
        </span>
      </nav>

      <header className="mt-6">
        <p className="inline-flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
          <ScissorsIcon aria-hidden className="size-3.5" />
          Appointment book
        </p>
        <h1 className="mt-2 font-display text-3xl leading-[1.05] text-foreground sm:text-4xl">
          Manage <span className="italic">appointments</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every request from every customer, in one place. Confirm a pending
          booking, or cancel a pending or confirmed one when plans change.
        </p>
      </header>

      {error ? (
        <LoadError message={error} />
      ) : appointments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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

          <section
            aria-labelledby="admin-appointments-heading"
            className="mt-10"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
              <h2
                id="admin-appointments-heading"
                className="font-display text-2xl leading-none text-foreground"
              >
                All requests
              </h2>
              <p className="text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                {counts.total === 1
                  ? "1 appointment"
                  : `${counts.total} appointments`}
              </p>
            </div>

            <ul role="list" className="mt-5 grid gap-4">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <AdminAppointmentCard appointment={appointment} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}


async function getAdminAppointments(
  token: string
): Promise<{ appointments: AdminAppointmentRow[]; error: string | null }> {
  try {
    const response = await backendFetch("/admin/appointments", {
      method: "GET",
      headers: { ...backendAuthHeader(token) },
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      return {
        appointments: [],
        error:
          payload?.error ??
          `The appointments API answered with status ${response.status}.`,
      }
    }

    const payload: unknown = await response.json()

    if (!Array.isArray(payload)) {
      return {
        appointments: [],
        error: "The appointments API returned an unexpected response.",
      }
    }

    return { appointments: parseAdminAppointmentList(payload), error: null }
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
        Queue is clear
      </p>
      <h2 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
        No appointment requests yet.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        When a customer requests a booking, it will appear here with their
        details and the service they chose.
      </p>

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={routes.adminServices} />}
        className="mt-6 h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        Review services
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
        We couldn’t load the appointment requests.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* A plain anchor forces a fresh request instead of a cached navigation. */}
        <Button
          nativeButton={false}
          render={<a href={routes.adminAppointments} />}
          className="h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          <RefreshCwIcon aria-hidden />
          Try again
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.adminDashboard} />}
          className="h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}

function AppointmentsSkeleton() {
  return (
    <div aria-label="Loading appointment requests" aria-busy="true">
      <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-3 w-32 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-10 w-80 max-w-full animate-pulse rounded-lg bg-muted" />
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
            className="h-64 animate-pulse rounded-3xl bg-muted/50"
          />
        ))}
      </div>
    </div>
  )
}
