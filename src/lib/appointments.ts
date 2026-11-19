/**
 * SalonBook appointment domain.
 *
 * The Express API does not have an appointments endpoint yet, so nothing in
 * this file talks to the network. It holds the pieces the booking form needs
 * today — the slot list, limits and validation — plus the `IAppointment` shape
 * the backend will store, so the contract lives in one obvious place.
 */

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

/**
 * The form's validation rules.
 *
 * The same checks will run again on the server when the endpoint exists, so
 * this function only keeps the UX tidy — it is never a security boundary.
 */
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
