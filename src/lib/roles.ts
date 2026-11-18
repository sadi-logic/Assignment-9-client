/**
 * The two roles SalonBook supports. The values must match what Better Auth
 * stores on `user.role` (see `additionalFields` in `src/lib/auth.ts`), because
 * they are compared against the real session — never against client input.
 */
export const USER_ROLES = ["customer", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  admin: "Admin",
}

/** Narrows an untrusted value (e.g. `session.user.role`) to a known role. */
export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" && (USER_ROLES as readonly string[]).includes(value)
  )
}
