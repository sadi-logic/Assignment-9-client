import { createAuthClient } from "better-auth/react"

/**
 * Single Better Auth client instance.
 *
 * No `baseURL` is passed: the client defaults to the current origin and calls
 * `/api/auth/*`, so the same code works locally and on the deployed client.
 */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
