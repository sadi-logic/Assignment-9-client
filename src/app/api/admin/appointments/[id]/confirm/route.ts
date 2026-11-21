import { requireAdminSession } from "@/lib/admin-guard"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"

/**
 * Confirms one appointment as an admin.
 *
 * The browser sends no status and no user id: the Next route verifies the
 * session, forwards its token to Express, and Express looks the token up again
 * plus applies the "pending only" rule.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession(request)
  if (!guard.ok) return guard.response

  // In Next 16 `params` is a Promise, so it has to be awaited.
  const { id } = await context.params

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return Response.json(
      { error: "That appointment id is not valid." },
      { status: 400 }
    )
  }

  // Express verifies this token itself: without it, the backend answers 401
  // instead of trusting the Next.js call.
  let response: Response
  try {
    response = await backendFetch(`/admin/appointments/${id}/confirm`, {
      method: "PATCH",
      headers: {
        ...backendAuthHeader(guard.session.session.token),
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

  // Express explains 401/403/404/409 in JSON, so pass both through unchanged.
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    return Response.json(
      {
        error:
          payload?.error ??
          "The appointment could not be confirmed. Please try again.",
      },
      { status: response.status }
    )
  }

  return Response.json({ ok: true })
}
