"use client"

import { useState, type FormEvent } from "react"
import { InfoIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  APPOINTMENT_MESSAGE_MAX,
  APPOINTMENT_TIME_SLOTS,
  hasAppointmentErrors,
  todayIsoDate,
  validateAppointmentForm,
  type AppointmentFieldErrors,
} from "@/lib/appointments"
import { cn } from "cn"

/**
 * The customer's booking form: date, time slot and an optional note.
 *
 * Booking requests are not connected yet — the Express API still has no
 * `POST /appointments` route — so the submit button is deliberately disabled
 * and the panel says so. Everything else (validation, limits, controlled
 * inputs) is finished and will start working the moment the endpoint exists.
 */
export function AppointmentForm({ serviceName }: { serviceName: string }) {
  const [appointmentDate, setAppointmentDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<AppointmentFieldErrors>({})

  // Recomputed on every render so the minimum can never go stale.
  const minDate = todayIsoDate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const values = { appointmentDate, timeSlot, message }
    const nextErrors = validateAppointmentForm(values)
    setErrors(nextErrors)

    if (hasAppointmentErrors(nextErrors)) return

    // Reached only when appointment requests are switched on. Nothing is sent
    // today, and we never pretend an appointment was created.
    toast.info("Appointment requests aren't open yet — nothing was sent.")
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label
          htmlFor="appointment-date"
          className="text-[0.55rem] font-medium tracking-[0.22em] text-muted-foreground uppercase"
        >
          Appointment date
        </Label>
        <Input
          id="appointment-date"
          name="appointmentDate"
          type="date"
          min={minDate}
          value={appointmentDate}
          onChange={(event) => {
            setAppointmentDate(event.target.value)
            setErrors((current) => ({ ...current, appointmentDate: undefined }))
          }}
          onBlur={() => {
            // A past date can be typed by hand even with `min`, so check it.
            const nextErrors = validateAppointmentForm({
              appointmentDate,
              timeSlot,
              message,
            })
            setErrors((current) => ({
              ...current,
              appointmentDate: nextErrors.appointmentDate,
            }))
          }}
          aria-invalid={Boolean(errors.appointmentDate)}
          aria-describedby={
            errors.appointmentDate ? "appointment-date-error" : undefined
          }
          className="h-11 rounded-xl"
        />
        {errors.appointmentDate ? (
          <p
            id="appointment-date-error"
            role="alert"
            className="text-xs leading-relaxed text-destructive"
          >
            {errors.appointmentDate}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Today or a later date.
          </p>
        )}
      </div>

      <fieldset
        className="grid gap-2"
        onBlur={(event) => {
          // Only complain once focus leaves the whole slot group.
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return
          }

          if (!timeSlot) {
            setErrors((current) => ({
              ...current,
              timeSlot: "Select a time slot.",
            }))
          }
        }}
      >
        <legend className="text-[0.55rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Time slot
        </legend>

        <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {APPOINTMENT_TIME_SLOTS.map((slot) => {
            const selected = timeSlot === slot

            return (
              <label
                key={slot}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-center text-xs transition-colors outline-none",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60 has-[:focus-visible]:ring-offset-2",
                  selected
                    ? "border-brand-plum bg-brand-plum text-brand-cream"
                    : "border-border bg-background/60 text-foreground/75 hover:border-brand-gold/60 hover:text-foreground"
                )}
              >
                <input
                  type="radio"
                  name="timeSlot"
                  value={slot}
                  checked={selected}
                  onChange={() => {
                    setTimeSlot(slot)
                    setErrors((current) => ({ ...current, timeSlot: undefined }))
                  }}
                  className="sr-only"
                />
                {slot}
              </label>
            )
          })}
        </div>

        {errors.timeSlot ? (
          <p role="alert" className="text-xs leading-relaxed text-destructive">
            {errors.timeSlot}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label
            htmlFor="appointment-message"
            className="text-[0.55rem] font-medium tracking-[0.22em] text-muted-foreground uppercase"
          >
            Anything we should know?
          </Label>
          <span className="text-[0.65rem] text-muted-foreground tabular-nums">
            {message.length}/{APPOINTMENT_MESSAGE_MAX}
          </span>
        </div>
        <Textarea
          id="appointment-message"
          name="message"
          rows={4}
          maxLength={APPOINTMENT_MESSAGE_MAX}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            setErrors((current) => ({ ...current, message: undefined }))
          }}
          onBlur={() => {
            const nextErrors = validateAppointmentForm({
              appointmentDate,
              timeSlot,
              message,
            })
            setErrors((current) => ({
              ...current,
              message: nextErrors.message,
            }))
          }}
          placeholder="Allergies, inspiration photos, a preferred stylist…"
          aria-invalid={Boolean(errors.message)}
          className="min-h-24 rounded-xl"
        />
        {errors.message ? (
          <p role="alert" className="text-xs leading-relaxed text-destructive">
            {errors.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Optional.</p>
        )}
      </div>

      <div
        id="booking-status"
        className="rounded-xl border border-brand-gold/35 bg-brand-gold/10 px-3.5 py-3"
      >
        <p className="flex items-center gap-2 text-[0.55rem] font-medium tracking-[0.22em] text-brand-plum uppercase">
          <InfoIcon aria-hidden className="size-3.5" />
          Booking opens soon
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
          The salon is finishing its appointment system. You can prepare your
          request for {serviceName}, but it cannot be sent yet.
        </p>
      </div>

      <Button
        type="submit"
        disabled
        aria-describedby="booking-status"
        className="h-11 w-full rounded-full text-[0.65rem] tracking-[0.18em] uppercase"
      >
        Request appointment
      </Button>
    </form>
  )
}
