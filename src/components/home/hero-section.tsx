import Image from "next/image"
import Link from "next/link"
import { ArrowDownIcon, ArrowRightIcon, SparklesIcon } from "lucide-react"

import { routes } from "@/lib/site"

export function HomeHero({ image }: { image: string }) {
  return (
    <section className="mx-auto mt-4 w-full max-w-[84rem] px-3 sm:mt-6 sm:px-6 lg:px-10">
      <div className="relative isolate flex min-h-[34rem] items-end overflow-hidden rounded-[1.75rem] bg-brand-plum sm:min-h-[38rem] sm:items-center lg:min-h-[43rem] lg:rounded-[2rem]">
        <Image
          src={image}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 640px) 100vw, (max-width: 1350px) 96vw, 1280px"
          className="z-0 object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-linear-to-t from-brand-plum via-brand-plum/80 to-brand-plum/15 sm:bg-linear-to-r sm:from-brand-plum/95 sm:via-brand-plum/70 sm:to-brand-plum/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-linear-to-t from-black/25 via-transparent to-transparent"
        />

        <div className="relative z-20 w-full px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
              <SparklesIcon aria-hidden className="size-4" />
              Hair · Skin · Beauty
            </p>

            <h1 className="mt-5 font-display text-5xl leading-[0.98] text-brand-cream sm:text-6xl lg:text-7xl">
              A little care can change{" "}
              <span className="italic text-brand-gold">everything.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-brand-cream/85 sm:text-base">
              Find a treatment that feels like you. Explore thoughtful salon
              services, compare the details, and request a time for yourself.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={routes.services}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-cream px-6 text-[0.65rem] font-semibold tracking-[0.16em] text-brand-plum uppercase shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
              >
                Explore Salon Services
                <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
              <Link
                href="#featured-services"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.65rem] font-medium tracking-[0.14em] text-brand-cream/85 uppercase transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
              >
                Discover the menu
                <ArrowDownIcon aria-hidden className="size-3.5" />
              </Link>
            </div>
          </div>

          <p className="mt-12 text-[0.55rem] tracking-[0.22em] text-brand-cream/70 uppercase sm:absolute sm:right-10 sm:bottom-8 sm:mt-0 lg:right-16">
            Your next ritual starts here
          </p>
        </div>
      </div>
    </section>
  )
}
