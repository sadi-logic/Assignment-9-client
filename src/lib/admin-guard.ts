import { auth } from "@/lib/auth"

/**
 * Admin gate shared by the appointment action routes.
 *
 * This is the first line of defence: the request is rejected here before it
 * ever reaches Express. Express repeats the same checks against the real
 * session cookie, so a crafted request still cannot act as an admin.
 */
export async function requireAdminSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "Sign in as an administrator." },
        { status: 401 }
      ),
    }
  }

  if (session.user.role !== "admin") {
    return {
      ok: false as const,
      response: Response.json(
        { error: "Only administrators can manage appointments." },
        { status: 403 }
      ),
    }
  }

  if (session.user.isBlocked) {
    return {
      ok: false as const,
      response: Response.json(
        { error: "This account is blocked." },
        { status: 403 }
      ),
    }
  }

  return { ok: true as const, session }
}
