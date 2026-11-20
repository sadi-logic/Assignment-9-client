import { backendFetch } from "@/lib/backend"
import { requireAdminSession } from "@/lib/admin-guard"

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]">
) {
  const access = await requireAdminSession(request)
  if (!access.ok) return access.response

  const { id } = await context.params
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return Response.json({ error: "That customer id is not valid." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Send the access status as JSON." }, { status: 400 })
  }

  if (!isRecord(body) || typeof body.isBlocked !== "boolean") {
    return Response.json({ error: "Choose a valid access status." }, { status: 400 })
  }

  try {
    const response = await backendFetch(`/users/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ isBlocked: body.isBlocked }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      return Response.json(
        { error: payload?.error ?? "The customer access update failed." },
        { status: response.status }
      )
    }

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The customer access update failed.",
      },
      { status: 502 }
    )
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
