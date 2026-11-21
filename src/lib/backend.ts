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

/**
 * Authorization header for Express.
 *
 * Express's `verifyToken` middleware only accepts a bearer token: it looks the
 * token up in Better Auth's `session` collection and loads the matching user.
 * The token is taken from the session this server already verified, so the
 * browser's cookie never has to leave Next.js.
 *
 * An empty object is returned when there is no token, so callers can spread the
 * result into `headers` without a branch.
 */
export function backendAuthHeader(
  token?: string | null
): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {}
}
