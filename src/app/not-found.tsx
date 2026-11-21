import type { Metadata } from "next"
import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card/60 px-6 py-14 text-center shadow-sm sm:px-10">
        <CompassIcon aria-hidden className="mx-auto size-7 text-brand-gold" />

        <p className="mt-4 text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
          Error 404
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
          This page doesn’t exist.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The link may be broken or the page may have moved. Let’s get you
          back to something beautiful.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href={routes.home} />}
            className="h-10 rounded-full px-6 text-[0.65rem] tracking-[0.18em] uppercase"
          >
            Back to home
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href={routes.services} />}
            className="h-10 rounded-full px-6 text-[0.65rem] tracking-[0.18em] uppercase"
          >
            Browse services
          </Button>
        </div>
      </div>
    </main>
  )
}