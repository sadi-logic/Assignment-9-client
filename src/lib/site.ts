/**
 * Central brand + route configuration.
 * Keeping routes in one place means a future rename only touches this file.
 */
export const siteConfig = {
  name: "SalonBook",
  tagline: "Hair · Skin · Beauty",
  description:
    "SalonBook is a boutique salon booking platform for hair, skin, and beauty rituals — browse services, request appointments, and pay securely online.",
} as const;

export const routes = {
  home: "/",
  services: "/services",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  customerDashboard: "/dashboard/customer",
  customerAppointments: "/dashboard/customer/appointments",
  customerProfile: "/dashboard/customer/profile",
  adminDashboard: "/dashboard/admin",
  adminServices: "/dashboard/admin/services",
  adminServiceAdd: "/dashboard/admin/services/add",
  adminAppointments: "/dashboard/admin/appointments",
  adminUsers: "/dashboard/admin/users",
  adminTransactions: "/dashboard/admin/transactions",
  adminProfile: "/dashboard/admin/profile",
} as const;

/**
 * The dashboard a signed-in user belongs in. The role comes from the Better
 * Auth session (server-verified), never from anything the user can edit in the
 * browser.
 */
export function dashboardForRole(role?: string | null) {
  return role === "admin" ? routes.adminDashboard : routes.customerDashboard
}

export const publicNav = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
] as const;
