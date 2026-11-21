import { getAuthSession } from "@/lib/auth"
export async function requireAdminSession(request: Request) {
  const session = await getAuthSession(request.headers)

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
