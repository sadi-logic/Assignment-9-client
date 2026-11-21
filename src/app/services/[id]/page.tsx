import { Suspense, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import {
  ChevronRightIcon,
  ClockIcon,
  LockIcon,
  PauseCircleIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { AppointmentForm } from "@/components/services/appointment-form"
import { ServiceDetails } from "@/components/services/service-details"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getAuthSession } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import {
  formatServicePrice,
  isServiceId,
  parseServiceList,
  type ServiceRow,
} from "@/lib/services"
import { routes, serviceDetailsPath, signInHref } from "@/lib/site"

export const metadata: Metadata = {
  title: "Service details",
  description:
    "Everything about a SalonBook treatment — what it includes, how long it takes, what it costs, and how to request an appointment.",
}

/**
 * Protected Service Details page.
 *
 * The session is checked on the server before any service data is sent, so a
 * signed-out visitor never sees the page and is sent to sign in with a link
 * back to the service they were opening.
 */
export default function ServiceDetailsPage(props: PageProps<"/services/[id]">) {
  return (
    <main className="flex-1 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <Suspense fallback={<ServiceDetailsSkeleton />}>
          <ServiceDetailsContent params={props.params} />
        </Suspense>
      </div>
    </main>
  )
}

async function ServiceDetailsContent({
  params,
}: Pick<PageProps<"/services/[id]">, "params">) {
  const { id } = await params

  // A URL that cannot be a service id is not worth an API call.
  if (!isServiceId(id)) notFound()

  const session = await getAuthSession(await headers())

  if (!session?.user) {
    redirect(signInHref(serviceDetailsPath(id)))
  }

  let service: ServiceRow | null = null
  let loadError: string | null = null

  try {
    // The Express API has no `GET /services/:id` yet, so the list is fetched
    // once and the matching document is picked out of it. `no-store` keeps a
    // service that was just paused from showing as active.
    const response = await backendFetch("/services", { method: "GET" })

    if (!response.ok) {
      loadError = `The services API answered with status ${response.status}.`
    } else {
      const payload: unknown = await response.json()

      if (!Array.isArray(payload)) {
        loadError = "The services API returned an unexpected response."
      } else {
        service = parseServiceList(payload).find((item) => item.id === id) ?? null
      }
    }
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : BACKEND_UNAVAILABLE_MESSAGE
  }

  // A failed request is an error, not a missing service — never a 404.
  if (loadError) {
    return <LoadError message={loadError} retryHref={serviceDetailsPath(id)} />
  }

  if (!service) notFound()

  const isAdmin = session.user.role === "admin"
  const isBlocked = Boolean(session.user.isBlocked)

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase"
      >
        <Link
          href={routes.home}
          className="rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <ChevronRightIcon aria-hidden className="size-3 text-border" />
        <Link
          href={routes.services}
          className="rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Browse services
        </Link>
        <ChevronRightIcon aria-hidden className="size-3 text-border" />
        <span aria-current="page" className="text-foreground/80">
          {service.serviceName}
        </span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10">
        <ServiceDetails service={service} />

        <aside aria-labelledby="booking-heading" className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.55rem] font-medium tracking-[0.28em] text-brand-gold uppercase">
                  Reserve
                </p>
                <h2
                  id="booking-heading"
                  className="mt-1.5 font-display text-2xl leading-none text-foreground"
                >
                  Book this ritual
                </h2>
              </div>
              <p className="font-display text-2xl leading-none text-brand-plum">
                {formatServicePrice(service.price) ?? "—"}
              </p>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon aria-hidden className="size-3.5 text-brand-gold" />
              About {service.duration} minutes
            </p>

            <Separator className="my-5" />

            <BookingPanel
              service={service}
              isAdmin={isAdmin}
              isBlocked={isBlocked}
            />
          </div>

          <p className="mt-3 px-1 text-center text-[0.6rem] leading-relaxed text-muted-foreground">
            The salon reviews every request and confirms your slot before
            payment.
          </p>
        </aside>
      </div>
    </>
  )
}

/**
 * Chooses what the booking panel shows. Each branch is one sentence of policy,
 * so the page itself stays readable.
 */
function BookingPanel({
  service,
  isAdmin,
  isBlocked,
}: {
  service: ServiceRow
  isAdmin: boolean
  isBlocked: boolean
}) {
  if (service.status !== "active") {
    return (
      <PanelNotice
        icon={<PauseCircleIcon aria-hidden className="size-4" />}
        title="Not accepting bookings"
        text="This service is paused at the moment. Browse the rest of the menu while it comes back."
        action={{ href: routes.services, label: "Browse services" }}
      />
    )
  }

  if (isBlocked) {
    return (
      <PanelNotice
        icon={<LockIcon aria-hidden className="size-4" />}
        title="Account unavailable"
        text="Booking is disabled for this account. Please contact the salon if you think this is a mistake."
        action={{ href: routes.services, label: "Browse services" }}
      />
    )
  }

  if (isAdmin) {
    return (
      <PanelNotice
        icon={<ShieldCheckIcon aria-hidden className="size-4" />}
        title="You are viewing as an admin"
        text="Appointment requests belong to customers. Manage this service, its price and its availability from the dashboard."
        action={{ href: routes.adminServices, label: "Manage services" }}
      />
    )
  }

  return (
    <div>
      <p className="flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
        <SparklesIcon aria-hidden className="size-3.5 text-brand-gold" />
        Request an appointment
      </p>
      <div className="mt-4">
        <AppointmentForm
          serviceId={service.id}
          serviceName={service.serviceName}
        />
      </div>
    </div>
  )
}

function PanelNotice({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action: { href: string; label: string }
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-5">
      <p className="flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.22em] text-brand-plum uppercase">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={action.href} />}
        className="mt-4 h-9 w-full rounded-full text-[0.6rem] tracking-[0.16em] uppercase"
      >
        {action.label}
      </Button>
    </div>
  )
}

function LoadError({
  message,
  retryHref,
}: {
  message: string
  retryHref: string
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center"
    >
      <p className="font-display text-2xl text-foreground">
        We couldn’t load this service.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* A plain anchor forces a fresh request instead of a cached navigation. */}
        <Button
          nativeButton={false}
          render={<a href={retryHref} />}
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

function ServiceDetailsSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-3 w-56 animate-pulse rounded-full bg-muted" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10">
        <div>
          <div className="aspect-4/3 animate-pulse rounded-3xl bg-muted/70 sm:aspect-16/10" />
          <div className="mt-8 h-3 w-32 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl bg-muted/60"
              />
            ))}
          </div>
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-muted/60" />
      </div>
    </div>
  )
}
