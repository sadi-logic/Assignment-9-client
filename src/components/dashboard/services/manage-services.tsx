"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ScissorsIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import { EditServiceDialog } from "@/components/dashboard/services/edit-service-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatServicePrice, type ServiceRow, type ServiceStatus } from "@/lib/services"
import { routes } from "@/lib/site"
import { cn } from "cn"

/** The three ways this page can order the table. */
type SortOrder = "default" | "price-asc" | "price-desc"

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

/**
 * Sends one request and answers a single question: did it work?
 *
 * A network error counts as a failure too, so the handlers below can use a
 * plain `if (!ok)` instead of repeating try/catch three times.
 */
async function sendAdminRequest(url: string, init?: RequestInit) {
  try {
    const response = await fetch(url, init)
    return response.ok
  } catch {
    return false
  }
}

export function ManageServices({
  initialServices,
  loadError = null,
}: {
  /** Services fetched on the server before this page was rendered. */
  initialServices: ServiceRow[]
  /** Set when the API could not be reached, so the page can say so. */
  loadError?: string | null
}) {
  // The server's list becomes the starting state. Every action below updates it
  // only after the database has confirmed the change, so a reload shows the
  // same thing the screen shows.
  const [services, setServices] = useState<ServiceRow[]>(initialServices)

  const [searchText, setSearchText] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("default")

  // These two hold the row a dialog is currently about, or null when closed.
  const [editingService, setEditingService] = useState<ServiceRow | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceRow | null>(null)

  // Statistics always come from the current list, never from fixed numbers.
  const totalServices = services.length
  const activeServices = services.filter(
    (service) => service.status === "active"
  ).length
  const inactiveServices = totalServices - activeServices

  // Search is case-insensitive and runs on every keystroke.
  const searchTerm = searchText.trim().toLowerCase()
  const visibleServices = services.filter((service) =>
    service.serviceName.toLowerCase().includes(searchTerm)
  )

  // `filter` already returned a new array, so sorting it cannot reorder state.
  if (sortOrder === "price-asc") {
    visibleServices.sort((a, b) => a.price - b.price)
  } else if (sortOrder === "price-desc") {
    visibleServices.sort((a, b) => b.price - a.price)
  }

  async function handleToggleStatus(service: ServiceRow) {
    const nextStatus: ServiceStatus =
      service.status === "active" ? "inactive" : "active"

    // The whole row is sent, because the route checks all seven fields. Its
    // `id` and `createdAt` are ignored by the API.
    const ok = await sendAdminRequest(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...service, status: nextStatus }),
    })

    if (!ok) {
      toast.error("Could not update the service. Please try again.")
      return
    }

    // The row changes only after the database confirmed the update.
    setServices((current) =>
      current.map((item) =>
        item.id === service.id ? { ...item, status: nextStatus } : item
      )
    )

    toast.success(`“${service.serviceName}” is now ${nextStatus}.`)
  }

  /** Returns `true` when the save worked, so the dialog knows to close. */
  async function handleSaveEdit(updatedService: ServiceRow) {
    const ok = await sendAdminRequest(
      `/api/admin/services/${updatedService.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updatedService),
      }
    )

    if (!ok) {
      toast.error("Could not save the service. Please try again.")
      return false
    }

    setServices((current) =>
      current.map((item) =>
        item.id === updatedService.id ? updatedService : item
      )
    )
    setEditingService(null)
    toast.success("Service updated.")
    return true
  }

  async function handleConfirmDelete() {
    if (!deletingService) return

    // Copied out first, because the dialog is closed at the end of this function.
    const target = deletingService

    const ok = await sendAdminRequest(`/api/admin/services/${target.id}`, {
      method: "DELETE",
    })

    setDeletingService(null)

    if (!ok) {
      toast.error("Could not delete the service. Please try again.")
      return
    }

    setServices((current) => current.filter((item) => item.id !== target.id))
    toast.success(`“${target.serviceName}” was deleted.`)
  }

  return (
    <>
      {loadError ? (
        <div
          role="alert"
          className="mt-6 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5"
        >
          <TriangleAlertIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-destructive">Could not load services</p>
            <p className="mt-0.5">{loadError}</p>
            <p className="mt-0.5">
              Start the services API on port 5000, then reload this page.
            </p>
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="mt-6 flex gap-3 rounded-xl border border-brand-gold/30 bg-brand-cream/40 px-4 py-3.5"
        >
          <ScissorsIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-brand-plum/70"
          />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Live catalogue</p>
            <p className="mt-0.5">
              These services come from the database. Edits, status changes and
              deletions are saved immediately.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total services" value={totalServices} />
        <StatCard label="Active" value={activeServices} accent="plum" />
        <StatCard label="Inactive" value={inactiveServices} accent="muted" />
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-border/70 bg-card/60">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-xl leading-tight text-foreground">
              Service catalogue
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Showing {visibleServices.length} of {totalServices} services
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by service name"
                aria-label="Search services by name"
                className="h-9 pl-8"
              />
            </div>

            <Select
              items={SORT_OPTIONS}
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as SortOrder)}
            >
              <SelectTrigger
                aria-label="Sort services by price"
                className="h-9 w-full sm:w-52 data-[size=default]:h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-16 pl-4">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleServices.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-14 text-center">
                  {totalServices === 0 ? (
                    <>
                      <p className="whitespace-normal text-sm font-medium text-foreground">
                        No services yet.
                      </p>
                      <p className="mt-1 whitespace-normal text-xs text-muted-foreground">
                        Add the first treatment to your menu and it will appear
                        here.
                      </p>
                      <Button
                        size="sm"
                        nativeButton={false}
                        render={<Link href={routes.adminServiceAdd} />}
                        className="mt-4"
                      >
                        <PlusIcon />
                        Add a service
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="whitespace-normal text-sm font-medium text-foreground">
                        No services match “{searchText.trim()}”.
                      </p>
                      <p className="mt-1 whitespace-normal text-xs text-muted-foreground">
                        Try a different name, or clear the search to see all
                        services.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchText("")}
                        className="mt-4"
                      >
                        Clear search
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              visibleServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="pl-4">
                    <div className="relative size-11 overflow-hidden rounded-lg ring-1 ring-foreground/10">
                      <Image
                        src={service.image}
                        alt=""
                        fill
                        unoptimized
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[20rem] whitespace-normal">
                    <p className="truncate text-sm font-medium text-foreground">
                      {service.serviceName}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {service.description}
                    </p>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {service.category}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-medium tabular-nums">
                      {formatServicePrice(service.price) ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {service.duration} min
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={service.status} />
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${service.serviceName}`}
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setEditingService(service)}
                        >
                          <PencilIcon />
                          Edit service
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(service)}
                        >
                          {service.status === "active" ? (
                            <EyeOffIcon />
                          ) : (
                            <EyeIcon />
                          )}
                          {service.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingService(service)}
                        >
                          <Trash2Icon />
                          Delete service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {editingService ? (
        <EditServiceDialog
          key={editingService.id}
          service={editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSaveEdit}
        />
      ) : null}

      <AlertDialog
        open={deletingService !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingService(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deletingService?.serviceName}” will be permanently removed from
              the database. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep service</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function StatCard({
  label,
  value,
  accent = "default",
}: {
  label: string
  value: number
  accent?: "default" | "plum" | "muted"
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
      <p className="text-[0.55rem] font-medium tracking-[0.26em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-display text-3xl leading-none tabular-nums",
          accent === "plum" ? "text-brand-plum" : "text-foreground",
          accent === "muted" ? "text-muted-foreground" : null
        )}
      >
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const isActive = status === "active"

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 border-transparent px-2.5 text-[0.56rem] font-medium tracking-[0.16em] uppercase",
        isActive
          ? "bg-brand-plum text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-brand-gold" : "bg-muted-foreground/60"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}
