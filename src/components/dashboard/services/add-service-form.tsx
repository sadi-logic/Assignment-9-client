"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ServiceImageField } from "@/components/dashboard/services/service-image-field"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  SERVICE_IMAGE_HINT,
  SERVICE_LIMITS,
  createEmptyServiceForm,
  formatFileSize,
  formatServicePrice,
  hasServiceFormErrors,
  isServiceCategory,
  validateServiceForm,
  type ServiceFieldErrors,
  type ServiceFormValues,
  type ServiceStatus,
} from "@/lib/services"
import { ServicePublishError, publishService } from "@/lib/service-publishing"
import { routes } from "@/lib/site"
import { cn } from "cn"

const FIELD_IDS = {
  serviceName: "service-name",
  category: "service-category",
  description: "service-description",
  price: "service-price",
  duration: "service-duration",
  image: "service-image-trigger",
} as const

const FIELD_ORDER = [
  "serviceName",
  "category",
  "description",
  "price",
  "duration",
  "image",
] as const satisfies readonly (keyof typeof FIELD_IDS)[]

const CATEGORY_ITEMS = SERVICE_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))

const inputClass =
  "h-11 rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring"
const labelClass =
  "text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase"

const UPLOAD_UNAVAILABLE_MESSAGE =
  "Image hosting isn't configured, so a service cannot be saved yet. Add IMGBB_API_KEY to the server environment and restart the dev server."

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-cream/60 font-display text-sm text-brand-plum"
        >
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  )
}

function ServiceField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel id={`${id}-label`} htmlFor={id} className={labelClass}>
        {label}
      </FieldLabel>
      {children}
      {hint}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}

export function AddServiceForm({
  uploadConfigured = true,
}: {
  uploadConfigured?: boolean
}) {
  const [values, setValues] = useState<ServiceFormValues>(createEmptyServiceForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<ServiceFieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdService, setCreatedService] = useState<{ name: string } | null>(
    null
  )
  const [imageFieldKey, setImageFieldKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isActive = values.status === "active"

  function updateField<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current
    )
  }

  function focusFirstError(nextErrors: ServiceFieldErrors) {
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
    if (!firstInvalid) return

    const element = document.getElementById(FIELD_IDS[firstInvalid])
    element?.scrollIntoView({ behavior: "smooth", block: "center" })
    element?.focus({ preventScroll: true })
  }

  function resetForm() {
    setValues(createEmptyServiceForm())
    setImageFile(null)
    setErrors({})
    setSubmitError(null)
    // Remounts the picker so its local blob: preview is released as well.
    setImageFieldKey((current) => current + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setSubmitError(null)
    setCreatedService(null)

    const nextErrors = validateServiceForm(values, imageFile)

    setErrors(nextErrors)

    if (hasServiceFormErrors(nextErrors)) {
      focusFirstError(nextErrors)
      toast.error("Please review the highlighted fields.")
      return
    }

    if (!imageFile) return

    const submittedName = values.serviceName.trim()
    setIsSubmitting(true)

    try {
      const result = await publishService(values, imageFile)

      // Reached only after the API confirmed the insert.
      setCreatedService({ name: result.draft.serviceName })
      toast.success(`“${submittedName}” was added to the service menu.`)
      resetForm()
    } catch (error) {
      if (error instanceof ServicePublishError && error.fieldErrors) {
        setErrors(error.fieldErrors)
        focusFirstError(error.fieldErrors)
      }

      const message =
        error instanceof Error && error.message
          ? error.message
          : "The service could not be created. Nothing was saved."

      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8">
      {createdService ? (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-brand-gold/40 bg-brand-cream/50 px-4 py-4"
        >
          <CheckCircle2Icon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-brand-plum"
          />
          <div className="min-w-0 text-xs leading-relaxed text-muted-foreground">
            <p className="text-sm font-medium text-foreground">
              “{createdService.name}” is now on the service menu.
            </p>
            <p className="mt-1">
              The photo is hosted and the service was saved to the catalogue. You
              can add another below, or{" "}
              <Link
                href={routes.adminServices}
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                return to services
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      {!uploadConfigured ? (
        <div
          role="status"
          className={cn(
            "flex gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3.5",
            createdService ? "mt-3" : null
          )}
        >
          <AlertTriangleIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">
              Image hosting isn&apos;t configured
            </p>
            <p className="mt-0.5">{UPLOAD_UNAVAILABLE_MESSAGE}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <FormSection
            step="01"
            title="Basic information"
            description="Name the service, place it in a category and describe the experience."
          >
            <ServiceField
              id="service-name"
              label="Service name"
              error={errors.serviceName}
            >
              <Input
                id="service-name"
                name="serviceName"
                autoComplete="off"
                placeholder="e.g. Signature Silk Blowout"
                value={values.serviceName}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("serviceName", event.target.value)
                }
                aria-invalid={Boolean(errors.serviceName)}
                aria-describedby={
                  errors.serviceName ? "service-name-error" : undefined
                }
                className={inputClass}
              />
            </ServiceField>

            <ServiceField
              id="service-category"
              label="Service category"
              error={errors.category}
            >
              <Select
                items={CATEGORY_ITEMS}
                value={values.category || null}
                onValueChange={(value) =>
                  updateField(
                    "category",
                    isServiceCategory(value) ? value : ""
                  )
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="service-category"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? "service-category-error" : undefined
                  }
                  aria-labelledby="service-category-label"
                  className="h-11 w-full rounded-xl border-border/80 bg-background/60 px-3.5 text-[0.95rem] text-foreground focus-visible:ring-ring data-[size=default]:h-11"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ServiceField>

            <ServiceField
              id="service-description"
              label="Description"
              error={errors.description}
              hint={
                <FieldDescription className="flex items-center justify-between gap-3 text-xs">
                  <span>What the ritual includes, and who it suits.</span>
                  <span className="shrink-0 tabular-nums">
                    {values.description.length}/{SERVICE_LIMITS.descriptionMax}
                  </span>
                </FieldDescription>
              }
            >
              <Textarea
                id="service-description"
                name="description"
                rows={5}
                maxLength={SERVICE_LIMITS.descriptionMax}
                placeholder="A restorative blowout finished with our signature shine serum — ideal before an evening out."
                value={values.description}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "service-description-error" : undefined
                }
                className="field-sizing-fixed min-h-32 rounded-xl border-border/80 bg-background/60 px-3.5 py-3 text-[0.95rem] leading-relaxed text-foreground focus-visible:ring-ring"
              />
            </ServiceField>
          </FormSection>

          <FormSection
            step="02"
            title="Pricing & duration"
            description="What the service costs and how long the chair is reserved."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <ServiceField
                id="service-price"
                label="Price"
                error={errors.price}
                hint={
                  <FieldDescription className="text-xs">
                    Amount in {SERVICE_CURRENCY.code}.
                  </FieldDescription>
                }
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-sm text-muted-foreground"
                  >
                    {SERVICE_CURRENCY.symbol}
                  </span>
                  <Input
                    id="service-price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="3500"
                    value={values.price}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={
                      errors.price ? "service-price-error" : undefined
                    }
                    className={cn(
                      inputClass,
                      "pl-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    )}
                  />
                </div>
              </ServiceField>

              <ServiceField
                id="service-duration"
                label="Estimated duration"
                error={errors.duration}
                hint={
                  <FieldDescription className="text-xs">
                    Minutes reserved for the appointment.
                  </FieldDescription>
                }
              >
                <div className="relative">
                  <Input
                    id="service-duration"
                    name="duration"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="60"
                    value={values.duration}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("duration", event.target.value)
                    }
                    aria-invalid={Boolean(errors.duration)}
                    aria-describedby={
                      errors.duration ? "service-duration-error" : undefined
                    }
                    className={cn(
                      inputClass,
                      "pr-14 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    )}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase"
                  >
                    min
                  </span>
                </div>
              </ServiceField>
            </div>
          </FormSection>

          <FormSection
            step="03"
            title="Service image"
            description="The photo customers see in the service menu. Required."
          >
            <ServiceImageField
              key={imageFieldKey}
              file={imageFile}
              error={errors.image}
              disabled={isSubmitting}
              onSelect={(file) => {
                setImageFile(file)
                setErrors((current) => ({ ...current, image: undefined }))
              }}
              onRemove={() => {
                setImageFile(null)
                setErrors((current) => ({ ...current, image: undefined }))
              }}
              onReject={(message) => {
                setErrors((current) => ({ ...current, image: message }))
                toast.error(message)
              }}
            />

            <FieldError id="service-image-error">{errors.image}</FieldError>
          </FormSection>

          <FormSection
            step="04"
            title="Availability"
            description="Control whether the service can be booked right now."
          >
            <Field
              orientation="horizontal"
              className="items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <FieldTitle id="service-status-label" className="text-sm">
                    Visible to customers
                  </FieldTitle>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.55rem] font-medium tracking-[0.18em] uppercase",
                      isActive
                        ? "bg-brand-plum text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1 rounded-full",
                        isActive ? "bg-brand-gold" : "bg-muted-foreground"
                      )}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p
                  id="service-status-description"
                  className="mt-1 text-xs leading-relaxed text-muted-foreground"
                >
                  {isActive
                    ? "Customers can find and book this service."
                    : "Hidden from the booking menu until you switch it back on."}
                </p>
              </div>

              <Switch
                id="service-status"
                checked={isActive}
                onCheckedChange={(checked) =>
                  updateField(
                    "status",
                    (checked ? "active" : "inactive") satisfies ServiceStatus
                  )
                }
                disabled={isSubmitting}
                aria-labelledby="service-status-label"
                aria-describedby="service-status-description"
              />
            </Field>
          </FormSection>
        </div>

        <aside className="rounded-2xl border border-brand-gold/25 bg-brand-cream/35 p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.55rem] font-medium tracking-[0.3em] text-brand-plum/70 uppercase">
              At a glance
            </p>
            <SparklesIcon aria-hidden className="size-3.5 text-brand-gold" />
          </div>

          <p className="mt-3 line-clamp-2 font-display text-lg leading-snug text-foreground">
            {values.serviceName.trim() || "Untitled service"}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            {values.category || "No category yet"}
          </p>

          <dl className="mt-4 flex flex-col gap-2.5 border-t border-brand-gold/20 pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Price</dt>
              <dd className="text-sm font-medium text-foreground">
                {formatServicePrice(values.price) ?? "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="text-sm font-medium text-foreground">
                {values.duration.trim() ? `${values.duration.trim()} min` : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="text-sm font-medium text-foreground">
                {isActive ? "Active" : "Inactive"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-xl border border-dashed border-brand-gold/30 bg-background/50 px-3 py-2.5">
            <p className="text-[0.55rem] font-medium tracking-[0.2em] text-muted-foreground/80 uppercase">
              Image
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {imageFile
                ? `${imageFile.name} · ${formatFileSize(imageFile.size)}`
                : `Not selected · ${SERVICE_IMAGE_HINT}`}
            </p>
          </div>
        </aside>
      </div>

      {submitError || errors.form ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          {submitError ?? errors.form}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href={routes.adminServices} />}
          className="h-10 justify-start rounded-full px-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon />
          Back to services
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 rounded-full px-6 text-[0.7rem] tracking-[0.18em] uppercase"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Creating service…
            </>
          ) : (
            <>
              <SparklesIcon />
              Create service
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
