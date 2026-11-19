"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  SERVICE_CATEGORIES,
  SERVICE_CURRENCY,
  isServiceCategory,
  type ServiceRow,
} from "@/lib/services"

type EditServiceDialogProps = {
  /** The row being edited. Its current values prefill the form. */
  service: ServiceRow
  onClose: () => void
  /** Saves the edits. Resolves `true` when the database accepted them. */
  onSave: (updatedService: ServiceRow) => Promise<boolean>
}

/**
 * Prefilled edit dialog.
 *
 * It validates the fields, then hands the updated row to the page, which sends
 * the request. The dialog only closes once that request succeeded, so a failed
 * save keeps the form open with the values still in place.
 */
export function EditServiceDialog({
  service,
  onClose,
  onSave,
}: EditServiceDialogProps) {
  const [name, setName] = useState(service.serviceName)
  const [category, setCategory] = useState(service.category)
  const [description, setDescription] = useState(service.description)
  const [price, setPrice] = useState(String(service.price))
  const [duration, setDuration] = useState(String(service.duration))
  const [isActive, setIsActive] = useState(service.status === "active")
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const priceNumber = Number(price)
    const durationNumber = Number(duration)

    if (trimmedName.length < 3) {
      setError("Give the service a name of at least 3 characters.")
      return
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("Price must be greater than zero.")
      return
    }

    if (!Number.isInteger(durationNumber) || durationNumber <= 0) {
      setError("Duration must be a whole number of minutes above zero.")
      return
    }

    if (!isServiceCategory(category)) {
      setError("Choose a service category.")
      return
    }

    setError(null)
    setIsSaving(true)

    const saved = await onSave({
      ...service,
      serviceName: trimmedName,
      category,
      description: description.trim(),
      price: priceNumber,
      duration: durationNumber,
      status: isActive ? "active" : "inactive",
    })

    setIsSaving(false)

    if (!saved) {
      setError("Could not save the service. Please try again.")
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSave} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit service</DialogTitle>
            <DialogDescription>
              Update the details below. Changes are saved to the database as
              soon as you save.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-service-name">Service name</Label>
              <Input
                id="edit-service-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Signature Silk Blowout"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-service-category">Category</Label>
              <Select
                items={SERVICE_CATEGORIES.map((item) => ({
                  value: item,
                  label: item,
                }))}
                value={category}
                onValueChange={(value) =>
                  setCategory(isServiceCategory(value) ? value : "")
                }
              >
                <SelectTrigger
                  id="edit-service-category"
                  className="w-full data-[size=default]:h-8"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-service-price">
                  Price ({SERVICE_CURRENCY.code})
                </Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="edit-service-duration">Minutes</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-service-description">Description</Label>
              <Textarea
                id="edit-service-description"
                rows={3}
                className="field-sizing-fixed min-h-20"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? "Customers can book this service."
                    : "Hidden from the booking menu."}
                </p>
              </div>
              <Switch
                id="edit-service-status"
                checked={isActive}
                onCheckedChange={setIsActive}
                aria-label="Service is active"
              />
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
