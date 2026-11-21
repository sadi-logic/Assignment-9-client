
export const siteConfig = {
  name: "SalonBook",
  tagline: "Hair · Skin · Beauty",
  description:
    "SalonBook is a boutique salon booking platform for hair, skin, and beauty rituals — browse services, request appointments, and pay securely online.",
} as const;

export const routes = {
  home: "/",
  services: "/browse-services",
  salonDetails: "/salon-details",
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


export function dashboardForRole(role?: string | null) {
  return role === "admin" ? routes.adminDashboard : routes.customerDashboard
}


export function serviceDetailsPath(id: string) {
  return `/services/${id}`
}

export function appointmentCheckoutPath(appointmentId: string) {
  return `${routes.customerAppointments}/${encodeURIComponent(appointmentId)}/checkout`
}


export function safeReturnPath(value?: string | null) {
  if (!value) return null
  if (!value.startsWith("/") || value.startsWith("//")) return null
  if (value.startsWith(routes.signIn) || value.startsWith(routes.signUp)) {
    return null
  }

  return value
}

/** Adds a safe `?next=` destination to an auth link when there is one. */
export function authHref(path: string, nextPath?: string | null) {
  const safe = safeReturnPath(nextPath)
  return safe ? `${path}?next=${encodeURIComponent(safe)}` : path
}

export function signInHref(nextPath?: string | null) {
  return authHref(routes.signIn, nextPath)
}

export function signUpHref(nextPath?: string | null) {
  return authHref(routes.signUp, nextPath)
}


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
