

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


export function backendAuthHeader(
  token?: string | null
): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {}
}
