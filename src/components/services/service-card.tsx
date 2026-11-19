import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, ClockIcon, ScissorsIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatServicePrice, type ServiceRow } from "@/lib/services"
import { serviceDetailsPath } from "@/lib/site"

/**
 * One service in the Browse Services grid.
 *
 * Photos live on i.ibb.co (see `images.remotePatterns` in next.config.ts), so
 * Next resizes the original uploads down to what the card actually needs.
 */
export function ServiceCard({ service }: { service: ServiceRow }) {
  const price = formatServicePrice(service.price)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {service.image ? (
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          // A service without an image still gets a finished-looking card.
          <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-plum to-brand-plum/60 text-brand-cream">
            <ScissorsIcon aria-hidden className="size-8" />
          </div>
        )}

        <Badge
          variant="outline"
          className="absolute top-3 left-3 h-6 border-transparent bg-background/90 px-2.5 text-[0.55rem] font-medium tracking-[0.16em] text-foreground/80 uppercase backdrop-blur-sm"
        >
          {service.category}
        </Badge>

        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-brand-plum/85 px-2.5 py-1 text-[0.55rem] font-medium tracking-[0.14em] text-brand-cream uppercase backdrop-blur-sm">
          <ClockIcon aria-hidden className="size-3" />
          {service.duration} min
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-foreground">
            {service.serviceName}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="text-[0.5rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Price
            </p>
            <p className="mt-0.5 font-display text-2xl leading-none text-brand-plum">
              {price ?? "—"}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={serviceDetailsPath(service.id)} />}
            className="h-9 shrink-0 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
          >
            View details
            <ArrowRightIcon aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}
