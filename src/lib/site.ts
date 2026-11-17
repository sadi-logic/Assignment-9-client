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
} as const;

export const publicNav = [
  { label: "Home", href: routes.home },
  { label: "Browse Services", href: routes.services },
] as const;
