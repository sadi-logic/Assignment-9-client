import type { ReactNode } from "react"

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type AuthFieldProps = {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}

/**
 * One labelled form control with consistent SalonBook typography and error
 * wiring (`aria-describedby` points at the message rendered here).
 */
export function AuthField({ id, label, error, hint, children }: AuthFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel
        htmlFor={id}
        className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase"
      >
        {label}
      </FieldLabel>
      {children}
      {hint}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
