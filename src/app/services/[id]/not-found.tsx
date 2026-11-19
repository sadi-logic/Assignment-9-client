import Link from "next/link"
import { SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { routes } from "@/lib/site"

/**
 * Shown when `/services/[id]` is not a real service id, or when the id no
 * longer exists in the menu. It is deliberately different from the error state
 * inside the page: this one means "nothing here", not "the API is down".
 */
export default function ServiceNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card/60 px-6 py-14 text-center shadow-sm sm:px-10">
        <SearchXIcon aria-hidden className="mx-auto size-7 text-brand-gold" />

        <p className="mt-4 text-[0.55rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
          Not on the menu
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
          We couldn’t find that service.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The link may be out of date, or the treatment was taken off the menu.
          The rest of the catalogue is still waiting for you.
        </p>

        <Button
          nativeButton={false}
          render={<Link href={routes.services} />}
          className="mt-6 h-10 rounded-full px-6 text-[0.65rem] tracking-[0.18em] uppercase"
        >
          Browse services
        </Button>
      </div>
    </main>
  )
}
