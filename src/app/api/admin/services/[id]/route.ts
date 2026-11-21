import { getAuthSession } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import { parseServiceDraft } from "@/lib/services"

/**
 * Admin gate shared by the handlers below.
 *
 * The page already hides these buttons from customers, but a request can be
 * sent by hand, so the session is checked here as well. Returns a ready-made
 * error response when access is denied, and the verified session (whose token
 * Express will re-check) when the caller may continue.
 */
async function checkAdmin(request: Request) {
  const session = await getAuthSession(request.headers)

  if (!session?.user) {
    return Response.json(
      { error: "Sign in to manage services." },
      { status: 401 }
    )
  }

  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Only administrators can manage services." },
      { status: 403 }
    )
  }

  if (session.user.isBlocked) {
    return Response.json({ error: "This account is blocked." }, { status: 403 })
  }

  return session
}

/** A MongoDB `_id` is a 24-character hex string. Anything else is a bad request. */
function isServiceId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value)
}

/** One place that turns "the backend could not be reached" into a 502. */
function backendError(error: unknown) {
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

/**
 * Updates one service: the full row from the edit dialog, or the same row with
 * only `status` flipped when the admin activates/deactivates it.
 */
export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/services/[id]">
) {
  const access = await checkAdmin(request)
  if (access instanceof Response) return access

  // In Next 16 `params` is a Promise, so it has to be awaited.
  const { id } = await context.params

  if (!isServiceId(id)) {
    return Response.json({ error: "That service id is not valid." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Send the service as JSON." }, { status: 400 })
  }

  // The whole row is sent, so the same rules as the Add Service form apply.
  // This also drops `id` and `createdAt`, which the database must not receive.
  const parsed = parseServiceDraft(body)
  if (!parsed.ok) {
    return Response.json(
      { error: "Some fields need attention.", errors: parsed.errors },
      { status: 422 }
    )
  }

  let response: Response
  try {
    response = await backendFetch(`/services/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        ...backendAuthHeader(access.session.token),
      },
      body: JSON.stringify(parsed.data),
    })
  } catch (error) {
    return backendError(error)
  }

  // The Express 404 is plain text, so this status is checked before any parsing.
  if (response.status === 404) {
    return Response.json(
      { error: "That service no longer exists." },
      { status: 404 }
    )
  }

  if (!response.ok) {
    return Response.json(
      { error: "The services API rejected the update." },
      { status: 502 }
    )
  }

  return Response.json({ ok: true })
}

/** Removes one service. The confirmation dialog is the only thing before this. */
export async function DELETE(
  request: Request,
  context: RouteContext<"/api/admin/services/[id]">
) {
  const access = await checkAdmin(request)
  if (access instanceof Response) return access

  const { id } = await context.params

  if (!isServiceId(id)) {
    return Response.json({ error: "That service id is not valid." }, { status: 400 })
  }

  let response: Response
  try {
    response = await backendFetch(`/services/${id}`, {
      method: "DELETE",
      headers: { ...backendAuthHeader(access.session.token) },
    })
  } catch (error) {
    return backendError(error)
  }

  if (response.status === 404) {
    return Response.json(
      { error: "That service no longer exists." },
      { status: 404 }
    )
  }

  if (!response.ok) {
    return Response.json(
      { error: "The services API rejected the delete." },
      { status: 502 }
    )
  }

  return Response.json({ ok: true })
}
