
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
