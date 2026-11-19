import type { ReactNode } from "react"
import Image from "next/image"
import { ClockIcon, ScissorsIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatServicePrice, type ServiceRow } from "@/lib/services"

/**
 * The editorial half of the Service Details page: photo, name, description and
 * the three facts a customer checks before booking.
 *
 * It is a plain Server Component — it only renders the service object the page
 * already fetched, so it needs no state and no client JavaScript.
 */
export function ServiceDetails({ service }: { service: ServiceRow }) {
  const price = formatServicePrice(service.price)

  return (
    <article>
      <figure className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border/70 bg-muted sm:aspect-16/10">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-plum to-brand-plum/60 text-brand-cream">
            <ScissorsIcon aria-hidden className="size-10" />
          </div>
        )}

        <Badge
          variant="outline"
          className="absolute top-4 left-4 h-6 border-transparent bg-background/90 px-2.5 text-[0.55rem] font-medium tracking-[0.16em] text-foreground/80 uppercase backdrop-blur-sm"
        >
          {service.category}
        </Badge>
      </figure>

      <header className="mt-8">
        <p className="text-[0.55rem] font-medium tracking-[0.34em] text-brand-gold uppercase">
          The SalonBook menu
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
          {service.serviceName}
        </h1>
        <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      </header>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        <ServiceFact
          icon={<SparklesIcon aria-hidden className="size-4" />}
          label="Price"
          value={price ?? "—"}
        />
        <ServiceFact
          icon={<ClockIcon aria-hidden className="size-4" />}
          label="Estimated duration"
          value={`${service.duration} min`}
        />
        <ServiceFact
          icon={<ScissorsIcon aria-hidden className="size-4" />}
          label="Category"
          value={service.category}
        />
      </dl>
    </article>
  )
}

/**
 * One tile in the fact row. `dt`/`dd` keep the label and value connected for
 * screen readers without extra ARIA.
 */
function ServiceFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
      <dt className="flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
        <span className="text-brand-gold">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 truncate font-display text-xl leading-none text-foreground">
        {value}
      </dd>
    </div>
  )
}
