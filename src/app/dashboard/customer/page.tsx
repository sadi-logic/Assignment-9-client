import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  CalendarDaysIcon,
  CircleCheckIcon,
  CircleXIcon,
  Clock3Icon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  countAppointments,
  parseAppointmentList,
} from "@/lib/appointments"
import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import { dashboardForRole, routes } from "@/lib/site"

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CustomerDashboardContent />
    </Suspense>
  )
}

async function CustomerDashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect(routes.signIn)
  if (session.user.role !== "customer") {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  const { counts, error } = await getCustomerDashboardCounts(
    (await headers()).get("cookie") ?? ""
  )

  return (
    <main className="mx-auto w-full max-w-6xl">
      <p className="inline-flex items-center gap-2 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
        <SparklesIcon aria-hidden className="size-3.5" />
        Your SalonBook
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">
        Welcome, {session.user.name}.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Find a service that feels right, or keep track of the appointments
        you’ve already requested.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Appointment statistics could not be loaded: {error}
        </p>
      ) : counts ? (
        <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total requests"
            value={counts.total}
            icon={<CalendarDaysIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Pending"
            value={counts.pending}
            icon={<Clock3Icon aria-hidden className="size-4" />}
            tone="text-brand-gold"
          />
          <StatCard
            label="Confirmed"
            value={counts.confirmed}
            icon={<CircleCheckIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Cancelled"
            value={counts.cancelled}
            icon={<CircleXIcon aria-hidden className="size-4" />}
            tone="text-muted-foreground"
          />
        </dl>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <DashboardLink
          href={routes.services}
          title="Explore services"
          description="Browse treatments, compare prices, and request a time."
          action="Browse the menu"
          icon={<SparklesIcon aria-hidden className="size-5" />}
        />
        <DashboardLink
          href={routes.customerAppointments}
          title="My appointments"
          description="Review your booking requests and cancel pending appointments."
          action="View appointments"
          icon={<CalendarDaysIcon aria-hidden className="size-5" />}
        />
      </div>
    </main>
  )
}

async function getCustomerDashboardCounts(cookie: string) {
  try {
    const response = await backendFetch("/appointments", {
      method: "GET",
      headers: { cookie },
    })

    if (!response.ok) {
      return {
        counts: null,
        error: `The appointments API answered with status ${response.status}.`,
      }
    }

    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) {
      return { counts: null, error: "The appointments API returned an unexpected response." }
    }

    return {
      counts: countAppointments(parseAppointmentList(payload, [])),
      error: null,
    }
  } catch (requestError) {
    return {
      counts: null,
      error:
        requestError instanceof Error && requestError.message
          ? requestError.message
          : BACKEND_UNAVAILABLE_MESSAGE,
    }
  }
}

function StatCard({
  label,
  value,
  icon,
  tone = "text-brand-plum",
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
      <dt className="flex items-center justify-between gap-2 text-[0.55rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
        <span className={tone}>{icon}</span>
      </dt>
      <dd className="mt-1.5 font-display text-2xl leading-none text-foreground">
        {value}
      </dd>
    </div>
  )
}

function DashboardLink({
  href,
  title,
  description,
  action,
  icon,
}: {
  href: string
  title: string
  description: string
  action: string
  icon: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-brand-plum">
        {icon}
        <h2 className="font-display text-xl text-foreground">{title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button
        nativeButton={false}
        render={<Link href={href} />}
        className="mt-5 h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        {action}
      </Button>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse" aria-hidden>
      <div className="h-3 w-36 rounded-full bg-muted" />
      <div className="mt-4 h-10 w-80 max-w-full rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-44 rounded-2xl bg-muted/60" />
        <div className="h-44 rounded-2xl bg-muted/60" />
      </div>
    </div>
  )
}
