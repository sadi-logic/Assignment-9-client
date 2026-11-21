import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ClockIcon, SearchIcon, SparklesIcon } from "lucide-react"

import { ServiceCard } from "@/components/services/service-card"
import { ServiceFilters } from "@/components/services/service-filters"
import { Button } from "@/components/ui/button"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import {
  filterServices,
  isServiceCategory,
  isServiceSort,
  parseServiceList,
  type ServiceCategoryValue,
  type ServiceRow,
  type ServiceSort,
} from "@/lib/services"
import { browseServicesHref, routes, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore the SalonBook treatment menu — haircuts, colour, facials, makeup, nails and spa rituals — with clear prices and durations.",
}


export default function BrowseServicesPage(
  props: PageProps<"/browse-services">
) {
  return (
    <main className="flex-1 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <PageIntro />

        <Suspense fallback={<BrowseServicesSkeleton />}>
          <ServicesSection searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}


async function ServicesSection({
  searchParams,
}: Pick<PageProps<"/browse-services">, "searchParams">) {
  const params = await searchParams

  const search = readParam(params.search).trim()
  const rawCategory = readParam(params.category)
  const category: ServiceCategoryValue = isServiceCategory(rawCategory)
    ? rawCategory
    : ""
  const rawSort = readParam(params.sort)
  const sort: ServiceSort = isServiceSort(rawSort) ? rawSort : "default"

  let services: ServiceRow[] = []
  let loadError: string | null = null

  try {

    const response = await backendFetch("/services", { method: "GET" })

    if (!response.ok) {
      loadError = `The services API answered with status ${response.status}.`
    } else {
      const payload: unknown = await response.json()

      if (!Array.isArray(payload)) {
        loadError = "The services API returned an unexpected response."
      } else {
        services = parseServiceList(payload).filter(
          (service) => service.status === "active"
        )
      }
    }
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : BACKEND_UNAVAILABLE_MESSAGE
  }

  const visibleServices = filterServices(services, { search, category, sort })
  const hasFilters = search !== "" || category !== "" || sort !== "default"
  const retryHref = browseServicesHref({ search, category, sort })

  return (
    <section aria-labelledby="menu-heading" className="mt-8 sm:mt-10">
      <ServiceFilters search={search} category={category} sort={sort} />

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <p className="text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
            The menu
          </p>
          <h2
            id="menu-heading"
            className="mt-2 font-display text-2xl leading-none text-foreground sm:text-3xl"
          >
            {hasFilters ? "Matching services" : "All services"}
          </h2>
        </div>

        {loadError ? null : (
          <p className="text-xs text-muted-foreground" role="status">
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {visibleServices.length}
            </span>{" "}
            of {services.length} services
          </p>
        )}
      </div>

      {loadError ? (
        <LoadError message={loadError} retryHref={retryHref} />
      ) : visibleServices.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <ul role="list" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleServices.map((service) => (
            <li key={service.id} className="h-full">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}



function PageIntro() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-brand-cream/60 px-6 py-10 sm:px-10 sm:py-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-gold/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-brand-blush/40 blur-3xl"
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_18rem] lg:items-center">
        <div>
          <p className="text-[0.6rem] font-medium tracking-[0.34em] text-brand-gold uppercase">
            The SalonBook menu
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
            Rituals for hair, <span className="text-brand-plum italic">skin</span>{" "}
            &amp; soul.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Browse the full treatment menu — cuts and colour, facials, makeup,
            nails and slow spa rituals. Every price and duration below is taken
            straight from the salon, so you know exactly what to expect.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-2">
              <SparklesIcon aria-hidden className="size-3.5 text-brand-gold" />
              Seven curated categories
            </span>
            <span className="inline-flex items-center gap-2">
              <ClockIcon aria-hidden className="size-3.5 text-brand-gold" />
              Transparent pricing
            </span>
          </div>
        </div>

        {/* A CSS-only arch keeps the page distinctive without another image. */}
        <div
          aria-hidden
          className="relative mx-auto hidden h-60 w-44 sm:block lg:h-64 lg:w-48"
        >
          <div className="absolute inset-0 rounded-t-full rounded-b-2xl border border-brand-gold/40 bg-linear-to-b from-brand-plum/10 via-brand-cream/60 to-brand-cream" />
          <div className="absolute inset-3 rounded-t-full rounded-b-xl border border-brand-gold/25" />
          <div className="absolute inset-x-0 bottom-7 text-center">
            <span className="font-display text-5xl leading-none text-brand-plum">
              S
            </span>
            <span className="mt-2 block text-[0.45rem] tracking-[0.28em] text-muted-foreground uppercase">
              {siteConfig.tagline}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <SearchIcon aria-hidden className="mx-auto size-6 text-muted-foreground/70" />
      <p className="mt-3 font-display text-xl text-foreground">
        {hasFilters
          ? "No services match those filters."
          : "No services are available right now."}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {hasFilters
          ? "Try a shorter search, choose another category, or clear the filters to see the whole menu."
          : "The menu is being updated. Please check back in a moment."}
      </p>

      {hasFilters ? (
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.services} />}
          className="mt-5 h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
        >
          Clear filters
        </Button>
      ) : null}
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
      className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
    >
      <p className="font-display text-2xl text-foreground">
        We couldn’t load the menu.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Make sure the services API is running, then try again.
      </p>

      {/* A plain anchor forces one fresh request instead of a cached navigation. */}
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={retryHref} />}
        className="mt-5 h-9 rounded-full px-5 text-[0.6rem] tracking-[0.16em] uppercase"
      >
        Try again
      </Button>
    </div>
  )
}

function BrowseServicesSkeleton() {
  return (
    <div className="mt-10" aria-hidden>
      <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
      <div className="mt-10 h-3 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-border/70"
          >
            <div className="aspect-[4/3] animate-pulse bg-muted/70" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** `searchParams` values can repeat; the first one wins. */
function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}
