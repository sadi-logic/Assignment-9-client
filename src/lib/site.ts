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
  services: "/browse-services",
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

/**
 * Public details route for one service. The page itself is built in a later
 * task; this keeps the link target in one place.
 */
export function serviceDetailsPath(id: string) {
  return `/services/${id}`
}

/**
 * Builds a `/browse-services` URL from the current filters.
 *
 * Empty values are left out, so an untouched page is simply
 * `/browse-services` and a filtered one is short and shareable, e.g.
 * `/browse-services?search=hair&category=Makeup&sort=price-asc`.
 */
export function browseServicesHref(filters: {
  search?: string
  category?: string
  sort?: string
}) {
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.category) params.set("category", filters.category)
  if (filters.sort && filters.sort !== "default") params.set("sort", filters.sort)

  const query = params.toString()
  return query ? `${routes.services}?${query}` : routes.services
}

export const publicNav = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
] as const;
