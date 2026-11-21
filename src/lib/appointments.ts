/**
 * SalonBook appointment domain.
 *
 * Nothing in this file talks to the network. It holds the pieces the booking
 * form and the customer's appointment list share: the slot list, validation,
 * the `IAppointment` document shape, and small helpers that turn an API
 * response into the rows the UI renders.
 */

import type { ServiceRow } from "@/lib/services"

/** Statuses the salon can put an appointment in. */
export type AppointmentStatus = "pending" | "confirmed" | "cancelled"

/** Payment starts unpaid and is only settled after the salon confirms. */
export type PaymentStatus = "unpaid" | "paid"

/**
 * The `appointments` document described by the assignment.
 *
 * `customerId` always comes from the verified session on the server, and
 * `servicePrice`, `status`, `paymentStatus` and `createdAt` are written by the
 * backend — never sent by the browser.
 */
export interface IAppointment {
  serviceId: string
  customerId: string
  /** `YYYY-MM-DD`, the value a date input produces. */
  appointmentDate: string
  timeSlot: string
  message?: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt?: Date
}

/**
 * The slots the salon offers, on the hour from 10:00 to 19:00.
 * One list for the form today and for the backend's availability check later.
 */
export const APPOINTMENT_TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
] as const

export type AppointmentTimeSlot = (typeof APPOINTMENT_TIME_SLOTS)[number]

export const APPOINTMENT_MESSAGE_MAX = 500

/** What the form holds while the customer fills it in. */
export type AppointmentFormValues = {
  appointmentDate: string
  timeSlot: string
  message: string
}

export type AppointmentFieldErrors = Partial<
  Record<keyof AppointmentFormValues | "form", string>
>

/** A local `YYYY-MM-DD` string. `toISOString()` would shift the day in UTC+. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${date.getFullYear()}-${month}-${day}`
}

/** The earliest date a customer may pick: today, in the salon's timezone. */
export function todayIsoDate(): string {
  return toIsoDate(new Date())
}

export function isAppointmentTimeSlot(
  value: unknown
): value is AppointmentTimeSlot {
  return (
    typeof value === "string" &&
    (APPOINTMENT_TIME_SLOTS as readonly string[]).includes(value)
  )
}


export function validateAppointmentForm(
  values: AppointmentFormValues
): AppointmentFieldErrors {
  const errors: AppointmentFieldErrors = {}

  if (!values.appointmentDate) {
    errors.appointmentDate = "Choose an appointment date."
  } else if (Number.isNaN(Date.parse(values.appointmentDate))) {
    errors.appointmentDate = "Enter a valid date."
  } else if (values.appointmentDate < todayIsoDate()) {
    // ISO dates sort alphabetically too, so a string compare is enough.
    errors.appointmentDate = "Choose today or a later date."
  }

  if (!values.timeSlot) {
    errors.timeSlot = "Select a time slot."
  } else if (!isAppointmentTimeSlot(values.timeSlot)) {
    errors.timeSlot = "Choose one of the listed time slots."
  }

  if (values.message.trim().length > APPOINTMENT_MESSAGE_MAX) {
    errors.message = `Keep your message under ${APPOINTMENT_MESSAGE_MAX} characters.`
  }

  return errors
}

export function hasAppointmentErrors(errors: AppointmentFieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export type AppointmentSubmission = {
  serviceId: string
  appointmentDate: string
  timeSlot: AppointmentTimeSlot
  message: string
}

export type AppointmentSubmissionParseResult =
  | { ok: true; data: AppointmentSubmission }
  | { ok: false; errors: AppointmentFieldErrors }

/** Validates a booking request again in a Next.js API route. */
export function parseAppointmentSubmission(
  input: unknown
): AppointmentSubmissionParseResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      errors: { form: "Send the appointment as a JSON object." },
    }
  }

  const body = input as Record<string, unknown>
  const values: AppointmentFormValues = {
    appointmentDate:
      typeof body.appointmentDate === "string" ? body.appointmentDate : "",
    timeSlot: typeof body.timeSlot === "string" ? body.timeSlot : "",
    message: typeof body.message === "string" ? body.message : "",
  }
  const errors = validateAppointmentForm(values)

  const serviceId =
    typeof body.serviceId === "string" ? body.serviceId.trim() : ""
  if (!/^[a-f\d]{24}$/i.test(serviceId)) {
    errors.form = "Choose a valid service."
  }

  if (hasAppointmentErrors(errors)) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      serviceId,
      appointmentDate: values.appointmentDate,
      timeSlot: values.timeSlot as AppointmentTimeSlot,
      message: values.message.trim(),
    },
  }
}


export type AppointmentDocument = {
  _id: string
  serviceId?: string
  customerId?: string
  appointmentDate?: string
  timeSlot?: string
  message?: string
  servicePrice?: number
  paymentStatus?: string
  status?: string
  createdAt?: string
}


export type AppointmentRow = {
  id: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  serviceDescription: string
  serviceImage: string
  appointmentDate: string
  timeSlot: string
  message: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt: string
}

export function isAppointmentStatus(
  value: unknown
): value is AppointmentStatus {
  return value === "pending" || value === "confirmed" || value === "cancelled"
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "unpaid" || value === "paid"
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
}

/** The service fields the appointment list needs for display. */
type AppointmentServiceDetails = {
  serviceName?: string
  category?: string
  description?: string
  image?: string
}

/**
 * Turns one API document into a row the appointment card can render.
 *
 * The service is optional: if it was deleted, the appointment still belongs to
 * the customer, so it is shown with a neutral fallback instead of disappearing.
 */
function toAppointmentRow(
  document: AppointmentDocument,
  service?: AppointmentServiceDetails
): AppointmentRow {
  const serviceId = document.serviceId ?? ""

  return {
    id: document._id,
    serviceId,
    serviceName: service?.serviceName || "Service no longer listed",
    serviceCategory: service?.category || "Salon service",
    serviceDescription: service?.description || "",
    serviceImage: service?.image || "",
    appointmentDate: document.appointmentDate ?? "",
    timeSlot: document.timeSlot ?? "",
    message: document.message ?? "",
    servicePrice:
      typeof document.servicePrice === "number" ? document.servicePrice : 0,
    // The backend only writes these two values, so the fallbacks are just for
    // malformed data and keep the UI from crashing.
    paymentStatus: isPaymentStatus(document.paymentStatus)
      ? document.paymentStatus
      : "unpaid",
    status: isAppointmentStatus(document.status) ? document.status : "pending",
    createdAt: document.createdAt ?? "",
  }
}

function isAppointmentDocument(value: unknown): value is AppointmentDocument {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AppointmentDocument)._id === "string"
  )
}

/** Parses a `GET /appointments` body and joins each row to its service. */
export function parseAppointmentList(
  input: unknown,
  services: ServiceRow[]
): AppointmentRow[] {
  if (!Array.isArray(input)) return []

  const servicesById = new Map(services.map((service) => [service.id, service]))

  return input
    .filter(isAppointmentDocument)
    .map((document) =>
      toAppointmentRow(document, servicesById.get(document.serviceId ?? ""))
    )
}

/* -------------------------------------------------------------------------- */
/* Admin appointment list                                                     */
/* -------------------------------------------------------------------------- */

/** Customer details attached by the protected admin endpoint. */
export type AppointmentCustomerDocument = {
  name?: string
  email?: string
  image?: string
}

/** Service details attached by the protected admin endpoint. */
export type AppointmentServiceDocument = AppointmentServiceDetails & {
  status?: string
}

/** One appointment exactly as `GET /admin/appointments` sends it. */
export type AdminAppointmentDocument = AppointmentDocument & {
  service?: AppointmentServiceDocument | null
  customer?: AppointmentCustomerDocument | null
}

/** An admin row: the shared appointment fields plus the customer block. */
export type AdminAppointmentRow = AppointmentRow & {
  customerName: string
  customerEmail: string
  customerImage: string
}

function isAdminAppointmentDocument(
  value: unknown
): value is AdminAppointmentDocument {
  return isAppointmentDocument(value)
}

/**
 * Parses the protected admin list.
 *
 * Express already attaches the customer and service objects, so this needs no
 * second request and never touches the unprotected `/users` endpoint.
 */
export function parseAdminAppointmentList(
  input: unknown
): AdminAppointmentRow[] {
  if (!Array.isArray(input)) return []

  return input.filter(isAdminAppointmentDocument).map((document) => ({
    ...toAppointmentRow(document, document.service ?? undefined),
    customerName: document.customer?.name?.trim() || "Deleted customer",
    customerEmail: document.customer?.email?.trim() || "No email on file",
    customerImage: document.customer?.image?.trim() || "",
  }))
}

/** Admins may confirm only pending requests. */
export function canConfirmAppointment(appointment: AppointmentRow): boolean {
  return appointment.status === "pending"
}

/** Admins may cancel pending or confirmed appointments, never cancelled ones. */
export function canAdminCancelAppointment(
  appointment: AppointmentRow
): boolean {
  return appointment.status === "pending" || appointment.status === "confirmed"
}

/** "2026-11-25" → "Wed, Nov 25, 2026" (local time, so the day cannot shift). */
export function formatAppointmentDate(value: string): string {
  if (!value) return "Date to be confirmed"

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "Date to be confirmed"

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** An ISO timestamp → "Nov 19, 2026". */
export function formatRequestedAt(value: string): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** The four counters shown above the list, all derived from real data. */
export type AppointmentCounts = {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

export function countAppointments(
  appointments: AppointmentRow[]
): AppointmentCounts {
  return appointments.reduce<AppointmentCounts>(
    (counts, appointment) => {
      counts[appointment.status] += 1
      return counts
    },
    { total: appointments.length, pending: 0, confirmed: 0, cancelled: 0 }
  )
}

/** Customers may cancel only their own pending appointments. */
export function canCancelAppointment(appointment: AppointmentRow): boolean {
  return appointment.status === "pending"
}

/** Payment opens only after the salon confirms, and only while unpaid. */
export function canPayAppointment(appointment: AppointmentRow): boolean {
  return (
    appointment.status === "confirmed" && appointment.paymentStatus === "unpaid"
  )
}
