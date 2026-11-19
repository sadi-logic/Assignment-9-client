import Link from "next/link"
import {
  DropletsIcon,
  Flower2Icon,
  HandIcon,
  PaletteIcon,
  ScissorsIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"

import { SERVICE_CATEGORIES } from "@/lib/services"
import { browseServicesHref } from "@/lib/site"

const categoryDetails = [
  { label: SERVICE_CATEGORIES[0], note: "Cuts, shapes & styling", Icon: ScissorsIcon },
  { label: SERVICE_CATEGORIES[1], note: "Colour made personal", Icon: PaletteIcon },
  { label: SERVICE_CATEGORIES[2], note: "Care from root to tip", Icon: DropletsIcon },
  { label: SERVICE_CATEGORIES[3], note: "A fresh-faced feeling", Icon: SparklesIcon },
  { label: SERVICE_CATEGORIES[4], note: "Your look, your moment", Icon: WandSparklesIcon },
  { label: SERVICE_CATEGORIES[5], note: "A little polish & care", Icon: HandIcon },
  { label: SERVICE_CATEGORIES[6], note: "Slow down and unwind", Icon: Flower2Icon },
] as const

export function ServiceCategories() {
  return (
    <section
      aria-labelledby="service-categories-heading"
      className="mt-20 bg-brand-cream/65 py-14 sm:mt-24 sm:py-16 lg:mt-28 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[84rem] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[0.58rem] font-medium tracking-[0.28em] text-brand-gold uppercase">
            Explore by mood
          </p>
          <h2
            id="service-categories-heading"
            className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl"
          >
            What would feel good <span className="text-brand-plum italic">today?</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Start with what you have in mind. There is a little something for
            every kind of self-care day.
          </p>
        </div>

        <ul
          role="list"
          className="mt-9 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          {categoryDetails.map(({ label, note, Icon }, index) => (
            <li key={label}>
              <Link
                href={browseServicesHref({ category: label })}
                className="group flex min-h-28 items-center gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-32 sm:p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-cream text-brand-plum transition-colors group-hover:bg-brand-plum group-hover:text-brand-cream">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg leading-tight text-foreground">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {note}
                  </span>
                  <span className="sr-only">
                    Browse {label.toLowerCase()} services
                  </span>
                </span>
                <span
                  aria-hidden
                  className="ml-auto self-start font-display text-xs text-brand-gold"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
