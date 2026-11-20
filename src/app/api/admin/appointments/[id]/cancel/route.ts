import { requireAdminSession } from "@/lib/admin-guard"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"

/**
 * Cancels one appointment as an admin.
 *
 * Pending and confirmed appointments may be cancelled. Express enforces that
 * rule atomically, and it never touches the payment status.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession(request)
  if (!guard.ok) return guard.response

  const { id } = await context.params

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return Response.json(
      { error: "That appointment id is not valid." },
      { status: 400 }
    )
  }

  const cookie = request.headers.get("cookie")
  if (!cookie) {
    return Response.json(
      { error: "Sign in as an administrator." },
      { status: 401 }
    )
  }

  let response: Response
  try {
    response = await backendFetch(`/admin/appointments/${id}/cancel`, {
      method: "PATCH",
      headers: { cookie },
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
