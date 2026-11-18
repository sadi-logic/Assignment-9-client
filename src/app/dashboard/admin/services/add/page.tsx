import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { AddServiceForm } from "@/components/dashboard/services/add-service-form"
import { auth } from "@/lib/auth"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Add Service",
  description:
    "Create a new treatment for the SalonBook service menu — pricing, duration, photo and availability.",
}

/**
 * Admin-only page.
 *
 * `auth.api.getSession` reads the signed session cookie on the server, so a
 * customer never receives the form markup — hiding the sidebar link is not the
 * protection. The read is wrapped in <Suspense> because Cache Components
 * requires request-time data to live inside a boundary.
 */
export default function AddServicePage() {
  return (
    <Suspense fallback={<AddServicePageSkeleton />}>
      <AdminServicePage />
    </Suspense>
  )
}

async function AdminServicePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect(routes.signIn)
  }

  if (session.user.role !== "admin") {
    redirect(routes.customerDashboard)
  }

  // Only a boolean crosses into the client: the key itself stays server-side.
  const uploadConfigured = Boolean(process.env.IMGBB_API_KEY?.trim())

  return (
    <div className="mx-auto w-full max-w-6xl">
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
        <Link
          href={routes.adminServices}
          className="rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Services
        </Link>
        <ChevronRightIcon aria-hidden className="size-3 text-border" />
        <span aria-current="page" className="text-foreground/80">
          Add service
        </span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="text-[0.6rem] tracking-[0.34em] text-brand-gold uppercase">
          Service catalogue
        </p>
        <h1 className="mt-3 font-display text-3xl leading-[1.05] text-foreground sm:text-4xl">
          Add a new <span className="italic">service</span>.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Shape how this treatment appears across SalonBook — its name, price,
          timing and the photograph customers see.
        </p>
      </header>

      <AddServiceForm uploadConfigured={uploadConfigured} />
    </div>
  )
}

function AddServicePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-hidden>
      <div className="h-3 w-52 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-9 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-96 max-w-full animate-pulse rounded-full bg-muted" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-44 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted/60" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  )
}
