/**
 * Server-only helper. Google sign-in is optional: it is offered in the UI only
 * when both Google credentials are present in the environment.
 *
 * Never import this from a client component — `GOOGLE_CLIENT_SECRET` is not
 * exposed to the browser.
 */
export function isGoogleAuthEnabled() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  )
}
