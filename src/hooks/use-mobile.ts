import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Tracks the shadcn mobile breakpoint.
 *
 * `useSyncExternalStore` keeps the media query as the single source of truth,
 * so the value is read during render instead of being written from an effect
 * (which caused a cascading render and an ESLint error). The server snapshot is
 * `false`, matching the desktop-first markup the sidebar renders on the server.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
