import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "cn"

import {
  getPasswordChecks,
  PASSWORD_MIN_LENGTH,
} from "@/lib/validation"

const rules = [
  { key: "minLength", label: `${PASSWORD_MIN_LENGTH}+ characters` },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "lowercase", label: "One lowercase letter" },
] as const

/**
 * Live feedback for the password policy. The same rules are enforced again on
 * the server, so they cannot be skipped by disabling JavaScript.
 */
export function PasswordChecklist({ password }: { password: string }) {
  const checks = getPasswordChecks(password)

  return (
    <ul className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
      {rules.map((rule) => {
        const met = checks[rule.key]

        return (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              met ? "text-brand-plum" : "text-muted-foreground"
            )}
          >
            {met ? (
              <CheckIcon className="size-3.5" aria-hidden />
            ) : (
              <MinusIcon className="size-3.5" aria-hidden />
            )}
            {rule.label}
            <span className="sr-only">
              {met ? "— requirement met" : "— not met yet"}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
