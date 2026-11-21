import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  CalendarCheckIcon,
  CircleCheckIcon,
  Clock3Icon,
  ReceiptTextIcon,
  ScissorsIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAuthSession } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import {
  countAppointments,
  parseAdminAppointmentList,
} from "@/lib/appointments"
import { parseServiceList } from "@/lib/services"
import { parseTransactionList } from "@/lib/transactions"
import { dashboardForRole, routes } from "@/lib/site"

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  )
}

async function AdminDashboardContent() {
  const session = await getAuthSession(await headers())

  if (!session?.user) redirect(routes.signIn)
  if (session.user.role !== "admin") {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  const { stats, error } = await getAdminDashboardStats(session.session.token)

  return (
    <main className="mx-auto w-full max-w-6xl">
      <p className="inline-flex items-center gap-2 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
        <SparklesIcon aria-hidden className="size-3.5" />
        Salon management
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">
        Welcome, {session.user.name}.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Monitor customer activity, services, appointment requests, and payments.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Dashboard statistics could not be loaded: {error}
        </p>
      ) : stats ? (
        <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            label="Registered customers"
            value={stats.totalCustomers}
            icon={<UsersIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Active services"
            value={stats.activeServices}
            icon={<ScissorsIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Appointment requests"
            value={stats.appointments.total}
            icon={<CalendarCheckIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Pending appointments"
            value={stats.appointments.pending}
            icon={<Clock3Icon aria-hidden className="size-4" />}
            tone="text-brand-gold"
          />
          <StatCard
            label="Confirmed appointments"
            value={stats.appointments.confirmed}
            icon={<CircleCheckIcon aria-hidden className="size-4" />}
          />
          <StatCard
            label="Successful payments"
            value={stats.successfulPayments}
            icon={<ReceiptTextIcon aria-hidden className="size-4" />}
          />
        </dl>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <DashboardLink
          href={routes.adminServices}
          title="Manage services"
          description="Update prices and availability, or add and remove treatments."
          action="Open services"
          icon={<ScissorsIcon aria-hidden className="size-5" />}
        />
        <DashboardLink
          href={routes.adminAppointments}
          title="Manage appointments"
          description="Review requests and confirm or cancel customer bookings."
          action="Open appointments"
          icon={<CalendarCheckIcon aria-hidden className="size-5" />}
        />
      </div>
    </main>
  )
}

async function getAdminDashboardStats(token: string) {
  try {
    const [usersResponse, servicesResponse, appointmentsResponse, transactionsResponse] =
      await Promise.all([
        backendFetch("/users", { method: "GET", headers: { ...backendAuthHeader(token) } }),
        backendFetch("/services", { method: "GET" }),
        backendFetch("/admin/appointments", { method: "GET", headers: { ...backendAuthHeader(token) } }),
        backendFetch("/admin/transactions", { method: "GET", headers: { ...backendAuthHeader(token) } }),
      ])

    const apiResponses: Array<[string, Response]> = [
      ["customers", usersResponse],
      ["services", servicesResponse],
      ["appointments", appointmentsResponse],
      ["transactions", transactionsResponse],
    ]
    const failedResponse = apiResponses.find(([, response]) => !response.ok)

    if (failedResponse) {
      const [name, response] = failedResponse
      return {
        stats: null,
        error: `The ${name} API answered with status ${response.status}.`,
      }
    }

    const [users, services, appointmentDocuments, transactionDocuments] =
      await Promise.all([
        usersResponse.json(),
        servicesResponse.json(),
        appointmentsResponse.json(),
        transactionsResponse.json(),
      ]) as [unknown, unknown, unknown, unknown]

    if (
      !Array.isArray(users) ||
      !Array.isArray(services) ||
      !Array.isArray(appointmentDocuments) ||
      !Array.isArray(transactionDocuments)
    ) {
      return { stats: null, error: "An API returned an unexpected response." }
    }

    const appointmentCounts = countAppointments(
      parseAdminAppointmentList(appointmentDocuments)
    )
    const transactions = parseTransactionList(transactionDocuments)

    return {
      stats: {
        totalCustomers: users.length,
        activeServices: parseServiceList(services).filter(
          (service) => service.status === "active"
        ).length,
        appointments: appointmentCounts,
        successfulPayments: transactions.filter(
          (transaction) => transaction.paymentStatus === "paid"
        ).length,
      },
      error: null,
    }
  } catch (requestError) {
    return {
      stats: null,
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
