import Link from "next/link"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { ServiceCard } from "@/components/services/service-card"
import { routes } from "@/lib/site"
import type { ServiceRow } from "@/lib/services"

type FeaturedServicesProps = {
  services: ServiceRow[]
  activeServiceCount: number
  error: string | null
}

export function FeaturedServices({
  services,
  activeServiceCount,
  error,
}: FeaturedServicesProps) {
  return (
    <section
      id="featured-services"
      aria-labelledby="featured-services-heading"
      className="mx-auto mt-16 w-full max-w-[84rem] px-4 sm:mt-20 sm:px-6 lg:mt-24 lg:px-10"
    >
      <div className="flex flex-col gap-5 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.58rem] font-medium tracking-[0.28em] text-brand-gold uppercase">
            <SparklesIcon aria-hidden className="size-3.5" />
            A few salon favourites
          </p>
          <h2
            id="featured-services-heading"
            className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl"
          >
            Find your next <span className="text-brand-plum italic">ritual.</span>
          </h2>
        </div>

        <Link
          href={routes.services}
          className="inline-flex min-h-10 items-center gap-2 self-start text-[0.62rem] font-medium tracking-[0.16em] text-brand-plum uppercase transition-colors hover:text-brand-gold focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
        >
          Explore all services
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-8 text-center"
        >
          <p className="font-display text-2xl text-foreground">
            The service menu is unavailable right now.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-10 items-center rounded-full border border-border px-5 text-xs font-medium text-foreground transition-colors hover:border-brand-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Try again
          </Link>
        </div>
      ) : services.length === 0 ? (
        <p
          role="status"
          className="mt-7 rounded-2xl border border-border/70 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground"
        >
          There are no active services to feature right now. Please check back
          soon.
        </p>
      ) : (
        <>
          <ul
            role="list"
            className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          >
            {services.map((service) => (
              <li key={service.id} className="h-full">
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>

          {activeServiceCount < 6 ? (
            <p
              role="status"
              className="mt-5 text-center text-xs text-muted-foreground"
            >
              {activeServiceCount} active{" "}
              {activeServiceCount === 1 ? "service is" : "services are"}{" "}
              available to feature right now.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
