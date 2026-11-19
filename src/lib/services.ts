/**
 * SalonBook service domain.
 *
 * Everything the Add / Update Service form needs — categories, currency, image
 * rules, validation and the shape of a `services` document — lives here so the
 * form component stays purely presentational.
 */

import { isValidImageUrl } from "@/lib/validation"

/** Categories from the Assignment 9 brief, in the brief's order. */
export const SERVICE_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

/** Empty string means "nothing chosen yet"; kept separate from the union. */
export type ServiceCategoryValue = ServiceCategory | ""

export type ServiceStatus = "active" | "inactive"

export const SERVICE_STATUS_DEFAULT: ServiceStatus = "active"

/**
 * SalonBook prices are stored as plain numbers in BDT. The symbol lives here so
 * the whole app switches currency by editing one line.
 */
export const SERVICE_CURRENCY = {
  code: "BDT",
  symbol: "৳",
} as const

/**
 * The `services` collection document, exactly as specified by the assignment.
 * `createdAt` is assigned by the server, never collected from the form.
 */
export interface IService {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
  createdAt?: Date
}

/** The submitted object: a document without the server-owned timestamp. */
export type ServiceDraft = Omit<IService, "createdAt">

/**
 * A service document exactly as `GET /services` sends it.
 *
 * Over HTTP every value arrives as text or a number, so `_id` is a string and
 * `createdAt` is an ISO date string instead of a `Date`.
 */
export type ServiceDocument = {
  _id: string
  serviceName?: string
  category?: string
  description?: string
  price?: number
  duration?: number
  image?: string
  status?: string
  createdAt?: string
}

/**
 * A service as the Manage Services page holds it: the same fields plus a plain
 * string `id` to use as the React key and in `/api/admin/services/${id}`.
 */
export type ServiceRow = Omit<IService, "createdAt"> & {
  id: string
  createdAt?: string
}

/**
 * Turns one document from the API into a row the table can render.
 *
 * The fallbacks are only here so a half-filled document cannot break the page;
 * normal services always have every field.
 */
export function toServiceRow(document: ServiceDocument): ServiceRow {
  return {
    id: String(document._id),
    serviceName: document.serviceName ?? "",
    category: document.category ?? "",
    description: document.description ?? "",
    price: Number(document.price ?? 0),
    duration: Number(document.duration ?? 0),
    image: document.image ?? "",
    status: document.status === "inactive" ? "inactive" : "active",
  }
}

/** What the form holds while editing — numbers stay strings until validated. */
export type ServiceFormValues = {
  serviceName: string
  category: ServiceCategoryValue
  description: string
  price: string
  duration: string
  status: ServiceStatus
}

/**
 * `form` carries problems that belong to the whole request rather than one
 * input (malformed body, unreachable API), so a server response can be mapped
 * straight onto the form without inventing a second error shape.
 */
export type ServiceFieldErrors = Partial<
  Record<keyof ServiceFormValues | "image" | "form", string>
>

export const SERVICE_LIMITS = {
  nameMin: 3,
  nameMax: 80,
  descriptionMin: 20,
  descriptionMax: 600,
  priceMax: 1_000_000,
  durationMax: 1440,
} as const

/* -------------------------------------------------------------------------- */
/* Service image                                                              */
/* -------------------------------------------------------------------------- */

export const SERVICE_IMAGE_MAX_MB = 5
export const SERVICE_IMAGE_MAX_BYTES = SERVICE_IMAGE_MAX_MB * 1024 * 1024
export const SERVICE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const SERVICE_IMAGE_ACCEPT = SERVICE_IMAGE_TYPES.join(",")

export const SERVICE_IMAGE_HINT = `JPG, PNG or WebP · up to ${SERVICE_IMAGE_MAX_MB} MB`

/** Returns a ready-to-display message, or `null` when the file is acceptable. */
export function validateServiceImageFile(file: File): string | null {
  const looksLikeImage =
    (SERVICE_IMAGE_TYPES as readonly string[]).includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)

  if (!looksLikeImage) {
    return "Choose a JPG, PNG or WebP image."
  }

  if (file.size === 0) {
    return "That file is empty. Choose another image."
  }

  if (file.size > SERVICE_IMAGE_MAX_BYTES) {
    return `That image is larger than ${SERVICE_IMAGE_MAX_MB} MB. Choose a smaller file.`
  }

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const kilobytes = bytes / 1024
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`

  return `${(kilobytes / 1024).toFixed(1)} MB`
}

/* -------------------------------------------------------------------------- */
/* Form defaults, validation and payload                                      */
/* -------------------------------------------------------------------------- */

export function createEmptyServiceForm(): ServiceFormValues {
  return {
    serviceName: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    status: SERVICE_STATUS_DEFAULT,
  }
}

export function isServiceCategory(value: unknown): value is ServiceCategory {
  return (
    typeof value === "string" &&
    (SERVICE_CATEGORIES as readonly string[]).includes(value)
  )
}

/**
 * Single source of truth for the form's rules. Returns one message per invalid
 * field and an empty object when everything is acceptable.
 */
export function validateServiceForm(
  values: ServiceFormValues,
  imageFile: File | null
): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {}

  const name = values.serviceName.trim()
  if (!name) {
    errors.serviceName = "Enter the service name."
  } else if (name.length < SERVICE_LIMITS.nameMin) {
    errors.serviceName = `Use at least ${SERVICE_LIMITS.nameMin} characters.`
  } else if (name.length > SERVICE_LIMITS.nameMax) {
    errors.serviceName = `Keep the name under ${SERVICE_LIMITS.nameMax} characters.`
  }

  if (!isServiceCategory(values.category)) {
    errors.category = "Choose a service category."
  }

  const description = values.description.trim()
  if (!description) {
    errors.description = "Describe what this service includes."
  } else if (description.length < SERVICE_LIMITS.descriptionMin) {
    errors.description = `Add a little more detail — at least ${SERVICE_LIMITS.descriptionMin} characters.`
  } else if (description.length > SERVICE_LIMITS.descriptionMax) {
    errors.description = `Keep the description under ${SERVICE_LIMITS.descriptionMax} characters.`
  }

  const rawPrice = values.price.trim()
  if (!rawPrice) {
    errors.price = "Enter the service price."
  } else if (!/^\d+(\.\d{1,2})?$/.test(rawPrice)) {
    errors.price = "Enter a price with up to two decimal places."
  } else {
    const price = Number(rawPrice)
    if (!Number.isFinite(price) || price <= 0) {
      errors.price = "Price must be greater than zero."
    } else if (price > SERVICE_LIMITS.priceMax) {
      errors.price = `Price cannot exceed ${formatServicePrice(SERVICE_LIMITS.priceMax)}.`
    }
  }

  const rawDuration = values.duration.trim()
  if (!rawDuration) {
    errors.duration = "Enter the estimated duration."
  } else if (!/^\d+$/.test(rawDuration)) {
    errors.duration = "Use a whole number of minutes."
  } else {
    const duration = Number(rawDuration)
    if (duration <= 0) {
      errors.duration = "Duration must be greater than zero minutes."
    } else if (duration > SERVICE_LIMITS.durationMax) {
      errors.duration = `Duration cannot exceed ${SERVICE_LIMITS.durationMax} minutes (24 hours).`
    }
  }

  if (!imageFile) {
    errors.image = "Choose a service image."
  } else {
    const imageError = validateServiceImageFile(imageFile)
    if (imageError) errors.image = imageError
  }

  return errors
}

export function hasServiceFormErrors(errors: ServiceFieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}

/**
 * Converts validated form values into the exact `services` document the API
 * should receive. `imageUrl` is the hosted URL returned by the upload step, so
 * a `blob:` preview URL can never be persisted by accident.
 */
export function toServicePayload(
  values: ServiceFormValues,
  imageUrl: string
): ServiceDraft {
  if (!isServiceCategory(values.category)) {
    throw new Error("A valid service category is required.")
  }

  const price = Number(values.price)
  const duration = Number(values.duration)

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("A positive price is required.")
  }

  if (!Number.isInteger(duration) || duration <= 0) {
    throw new Error("A positive whole-minute duration is required.")
  }

  if (!imageUrl.trim()) {
    throw new Error("A hosted image URL is required.")
  }

  return {
    serviceName: values.serviceName.trim(),
    category: values.category,
    description: values.description.trim(),
    price,
    duration,
    image: imageUrl,
    status: values.status,
  }
}

/* -------------------------------------------------------------------------- */
/* Server-side validation                                                     */
/* -------------------------------------------------------------------------- */

export type ServiceDraftParseResult =
  | { ok: true; data: ServiceDraft }
  | { ok: false; errors: ServiceFieldErrors }

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key]
  return typeof value === "string" ? value.trim() : ""
}

/**
 * Validates a `services` document that arrived over HTTP.
 *
 * The route handler calls this instead of trusting the browser: a request can
 * be crafted by hand, so every rule the form applies is applied again here, and
 * only the whitelisted fields below survive into the database.
 */
export function parseServiceDraft(input: unknown): ServiceDraftParseResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      errors: { form: "Send the service as a JSON object." },
    }
  }

  const body = input as Record<string, unknown>
  const errors: ServiceFieldErrors = {}

  const serviceName = readString(body, "serviceName")
  if (!serviceName) {
    errors.serviceName = "Enter the service name."
  } else if (serviceName.length < SERVICE_LIMITS.nameMin) {
    errors.serviceName = `Use at least ${SERVICE_LIMITS.nameMin} characters.`
  } else if (serviceName.length > SERVICE_LIMITS.nameMax) {
    errors.serviceName = `Keep the name under ${SERVICE_LIMITS.nameMax} characters.`
  }

  const rawCategory = body.category
  const category = isServiceCategory(rawCategory) ? rawCategory : null
  if (!category) {
    errors.category = "Choose a service category."
  }

  const description = readString(body, "description")
  if (!description) {
    errors.description = "Describe what this service includes."
  } else if (description.length < SERVICE_LIMITS.descriptionMin) {
    errors.description = `Add a little more detail — at least ${SERVICE_LIMITS.descriptionMin} characters.`
  } else if (description.length > SERVICE_LIMITS.descriptionMax) {
    errors.description = `Keep the description under ${SERVICE_LIMITS.descriptionMax} characters.`
  }

  const price = typeof body.price === "number" ? body.price : Number.NaN
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than zero."
  } else if (price > SERVICE_LIMITS.priceMax) {
    errors.price = `Price cannot exceed ${formatServicePrice(SERVICE_LIMITS.priceMax)}.`
  } else if (Number(price.toFixed(2)) !== price) {
    errors.price = "Enter a price with up to two decimal places."
  }

  const duration = typeof body.duration === "number" ? body.duration : Number.NaN
  if (!Number.isInteger(duration) || duration <= 0) {
    errors.duration = "Duration must be a whole number of minutes above zero."
  } else if (duration > SERVICE_LIMITS.durationMax) {
    errors.duration = `Duration cannot exceed ${SERVICE_LIMITS.durationMax} minutes (24 hours).`
  }

  const image = readString(body, "image")
  if (!image) {
    errors.image = "A hosted image URL is required."
  } else if (!isValidImageUrl(image)) {
    errors.image = "The image URL must be a valid http(s) address."
  }

  const status = body.status
  if (status !== "active" && status !== "inactive") {
    errors.status = "Choose Active or Inactive."
  }

  if (Object.values(errors).some(Boolean)) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      serviceName,
      // Safe: validated above.
      category: category as string,
      description,
      price,
      duration,
      image,
      status: status as ServiceStatus,
    },
  }
}

/** `null` while the field holds no usable number, so callers can show a dash. */
export function formatServicePrice(value: number | string): string | null {
  const amount = typeof value === "string" ? Number(value.trim()) : value

  if (!Number.isFinite(amount) || amount <= 0) return null

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount)

  return `${SERVICE_CURRENCY.symbol}${formatted}`
}
