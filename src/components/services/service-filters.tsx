"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import {
  ChevronDownIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SERVICE_CATEGORIES,
  SERVICE_SORT_OPTIONS,
  type ServiceCategoryValue,
  type ServiceSort,
} from "@/lib/services"
import { browseServicesHref, routes } from "@/lib/site"

type ServiceFiltersProps = {
  search: string
  category: ServiceCategoryValue
  sort: ServiceSort
}


const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-input bg-transparent px-3 pr-9 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function ServiceFilters({ search, category, sort }: ServiceFiltersProps) {
  const router = useRouter()
  const hasFilters = search !== "" || category !== "" || sort !== "default"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const chosenCategory = String(form.get("category") ?? "")

    // One URL builder for the form, the empty state and the error state.
    router.push(
      browseServicesHref({
        search: String(form.get("search") ?? ""),
        category: chosenCategory === "all" ? "" : chosenCategory,
        sort: String(form.get("sort") ?? "default"),
      })
    )
  }

  return (
    <form
      key={`${search}|${category}|${sort}`}
      action={routes.services}
      method="get"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <SlidersHorizontalIcon aria-hidden className="size-3.5 text-brand-gold" />
        <p className="text-[0.55rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Search &amp; filter
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto] lg:items-end">
        <div className="grid gap-1.5">
          <Label
            htmlFor="service-search"
            className="text-[0.55rem] font-medium tracking-[0.24em] text-muted-foreground uppercase"
          >
            Service name
          </Label>
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="service-search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="e.g. facial, massage, haircut"
              className="h-11 pl-9"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="service-category"
            className="text-[0.55rem] font-medium tracking-[0.24em] text-muted-foreground uppercase"
          >
            Category
          </Label>
          <div className="relative">
            <select
              id="service-category"
              name="category"
              defaultValue={category || "all"}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className={SELECT_CLASS}
            >
              <option value="all">All categories</option>
              {SERVICE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="service-sort"
            className="text-[0.55rem] font-medium tracking-[0.24em] text-muted-foreground uppercase"
          >
            Sort by price
          </Label>
          <div className="relative">
            <select
              id="service-sort"
              name="sort"
              defaultValue={sort}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className={SELECT_CLASS}
            >
              {SERVICE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:col-span-2 lg:col-span-1">
          <Button
            type="submit"
            className="h-11 flex-1 rounded-full px-5 text-[0.65rem] tracking-[0.18em] uppercase lg:flex-none"
          >
            <SearchIcon aria-hidden />
            Search
          </Button>

          {hasFilters ? (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={routes.services} />}
              className="h-11 shrink-0 rounded-full px-3 text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
            >
              <XIcon aria-hidden />
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}
