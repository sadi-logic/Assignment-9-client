import { requireAdminSession } from "@/lib/admin-guard"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"


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
