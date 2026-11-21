import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import { parseServiceDraft } from "@/lib/services"

type InsertResult = {
  acknowledged?: boolean
  insertedId?: unknown
}

/**
 * Creates a service through the Express API in `salonbook-server`.
 *
 * This route is the admin gate. The browser never talks to port 5000 directly,
 * so `POST /services` cannot be reached by a customer through this app, and the
 * session is verified with Better Auth's own server API (the same check the
 * page uses) instead of a duplicated copy of its cookie logic.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return Response.json(
      { error: "Sign in to create a service." },
      { status: 401 }
    )
  }

  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Only administrators can create services." },
      { status: 403 }
    )
  }

  if (session.user.isBlocked) {
    return Response.json({ error: "This account is blocked." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Send the service as JSON." },
      { status: 400 }
    )
  }

  // Same rules as the form, applied again because a request can be crafted.
  const parsed = parseServiceDraft(body)
  if (!parsed.ok) {
    return Response.json(
      { error: "Some fields need attention.", errors: parsed.errors },
      { status: 422 }
    )
  }

  // The document is whitelisted by `parseServiceDraft`, so a client-supplied
  // `createdAt` or `_id` can never reach the database. `createdAt` is stamped
  // by the Express route, where it can be stored as a real BSON Date.
  const document = parsed.data

  let response: Response
  try {
    response = await backendFetch("/services", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...backendAuthHeader(session.session.token),
      },
      body: JSON.stringify(document),
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : BACKEND_UNAVAILABLE_MESSAGE,
      },
      { status: 502 }
    )
  }

  if (!response.ok) {
    return Response.json(
      { error: "The services API rejected the request. Nothing was saved." },
      { status: 502 }
    )
  }

  const result = (await response.json().catch(() => null)) as InsertResult | null

  if (result?.acknowledged === false) {
    return Response.json(
      { error: "The services API did not confirm the insert." },
      { status: 502 }
    )
  }

  return Response.json(
    {
      ok: true,
      id: result?.insertedId != null ? String(result.insertedId) : null,
    },
    { status: 201 }
  )
}
