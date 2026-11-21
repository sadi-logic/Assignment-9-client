import { getAuthSession } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"

/**
 * Cancels one appointment. The browser never chooses its owner. The Better
 * Auth cookie is forwarded to Express, which verifies the customer and
 * repeats the ownership and `pending` checks.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(request.headers)

  if (!session?.user) {
    return Response.json(
      { error: "Sign in to manage your appointments." },
      { status: 401 }
    )
  }

  if (session.user.role !== "customer") {
    return Response.json(
      { error: "Only customers can cancel appointments." },
      { status: 403 }
    )
  }

  if (session.user.isBlocked) {
    return Response.json({ error: "This account is blocked." }, { status: 403 })
  }

  // In Next 16 `params` is a Promise, so it has to be awaited.
  const { id } = await context.params

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return Response.json(
      { error: "That appointment id is not valid." },
      { status: 400 }
    )
  }

  let response: Response
  try {
    response = await backendFetch(`/appointments/${id}/cancel`, {
      method: "PATCH",
      headers: {
        ...backendAuthHeader(session.session.token),
      },
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

  // Express explains 404/403/409 in JSON, so pass both through unchanged. That
  // gives the dialog a real message instead of a generic failure.
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    return Response.json(
      {
        error:
          payload?.error ??
          "The appointment could not be cancelled. Please try again.",
      },
      { status: response.status }
    )
  }

  return Response.json({ ok: true })
}
