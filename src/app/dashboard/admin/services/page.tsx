import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ChevronRightIcon, PlusIcon } from "lucide-react"

import { ManageServices } from "@/components/dashboard/services/manage-services"
import { Button } from "@/components/ui/button"
import { getAuthSession } from "@/lib/auth"
import { backendFetch } from "@/lib/backend"
import {
  toServiceRow,
  type ServiceDocument,
  type ServiceRow,
} from "@/lib/services"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Manage Services",
  description:
    "Review the SalonBook service menu, search by name, sort by price and manage what customers can book.",
}


export default function ManageServicesPage() {
  return (
    <Suspense fallback={<ManageServicesSkeleton />}>
      <AdminServicesContent />
    </Suspense>
  )
}

async function AdminServicesContent() {
  const session = await getAuthSession(await headers())

  if (!session?.user) {
    redirect(routes.signIn)
  }

  if (session.user.role !== "admin") {
    redirect(routes.customerDashboard)
  }
  if (session.user.isBlocked) {
    redirect(routes.home)
  }

 
  let services: ServiceRow[] = []
  let loadError: string | null = null

  try {
    const response = await backendFetch("/services", { method: "GET" })

    if (response.ok) {
      const documents = (await response.json()) as ServiceDocument[]
      services = documents.map(toServiceRow)
    } else {
      loadError = "The services API could not be reached."
    }
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : "The services API could not be reached."
  }

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
        <span aria-current="page" className="text-foreground/80">
          Services
        </span>
      </nav>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.6rem] tracking-[0.34em] text-brand-gold uppercase">
            Service catalogue
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.05] text-foreground sm:text-4xl">
            Manage <span className="italic">services</span>.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every treatment on the menu, in one place. Update prices, switch a
            service off when it is unavailable, or add something new.
          </p>
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={routes.adminServiceAdd} />}
          className="h-10 shrink-0 rounded-full px-5 text-[0.7rem] tracking-[0.18em] uppercase"
        >
          <PlusIcon />
          Add new service
        </Button>
      </header>

      <ManageServices initialServices={services} loadError={loadError} />
    </div>
  )
}

function ManageServicesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-hidden>
      <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-9 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-96 max-w-full animate-pulse rounded-full bg-muted" />

      <div className="mt-6 h-14 animate-pulse rounded-xl bg-muted/60" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((card) => (
          <div key={card} className="h-20 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
      <div className="mt-4 h-80 animate-pulse rounded-2xl bg-muted/60" />
    </div>
  )
}
