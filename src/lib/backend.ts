/**
 * Server-only helpers for talking to the Express API in `../salonbook-server`.
 *
 * Never import this from a client component: it reads server environment
 * variables and must only run inside route handlers.
 */

export const BACKEND_UNAVAILABLE_MESSAGE =
  "The salon services API could not be reached. Please try again in a moment."

/** Overridable for deployment; defaults to the local Express server. */
export function backendUrl(path: string): string {
  const base = (process.env.SALONBOOK_API_URL?.trim() || "http://localhost:5000").replace(
    /\/+$/,
    ""
  )

  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * `fetch` with a timeout and a readable failure mode.
 *
 * A hung backend must not hang the admin's browser, and a connection refusal
 * (server not started) should surface as a clear 502 rather than a stack trace.
 */
export async function backendFetch(
  path: string,
  init: RequestInit,
  timeoutMs = 15_000
): Promise<Response> {
  try {
    return await fetch(backendUrl(path), {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
  } catch {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE)
  }
}
