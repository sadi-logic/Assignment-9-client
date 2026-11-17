import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

import type { auth } from "@/lib/auth"

/**
 * Single Better Auth client instance.
 *
 * No `baseURL` is passed: the client defaults to the current origin and calls
 * `/api/auth/*`, so the same code works locally and on the deployed client.
 *
 * `inferAdditionalFields` teaches the client about the custom `role` and
 * `isBlocked` user fields declared in `src/lib/auth.ts`.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = authClient
