import { getAuthSession } from "@/lib/auth"
import { parseAppointmentSubmission } from "@/lib/appointments"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import { parseServiceList } from "@/lib/services"

export async function POST(request: Request) {
  const session = await getAuthSession(request.headers)

  if (!session?.user) {
    return Response.json(
      { error: "Sign in to request an appointment." },
      { status: 401 }
    )
  }

  if (session.user.role !== "customer") {
    return Response.json(
      { error: "Only customers can request appointments." },
      { status: 403 }
    )
  }

  if (session.user.isBlocked) {
    return Response.json(
      { error: "This account is blocked and cannot book appointments." },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Send the appointment as JSON." },
      { status: 400 }
    )
  }

  const parsed = parseAppointmentSubmission(body)
  if (!parsed.ok) {
    return Response.json(
      { error: "Some fields need attention.", errors: parsed.errors },
      { status: 422 }
    )
  }

  let serviceResponse: Response
  try {
    serviceResponse = await backendFetch("/services", { method: "GET" })
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

  if (!serviceResponse.ok) {
    return Response.json(
      { error: "The services API could not verify this service." },
      { status: 502 }
    )
  }

  const servicePayload: unknown = await serviceResponse.json().catch(() => null)
  if (!Array.isArray(servicePayload)) {
    return Response.json(
      { error: "The services API returned an unexpected response." },
      { status: 502 }
    )
  }

  const service = parseServiceList(servicePayload).find(
    (item) => item.id === parsed.data.serviceId
  )

  if (!service) {
    return Response.json(
      { error: "That service no longer exists." },
      { status: 404 }
    )
  }

  if (service.status !== "active") {
    return Response.json(
      { error: "This service is inactive and cannot be booked." },
      { status: 409 }
    )
  }

  let appointmentResponse: Response
  try {
    appointmentResponse = await backendFetch("/appointments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...backendAuthHeader(session.session.token),
      },
      body: JSON.stringify({
        serviceId: parsed.data.serviceId,
        customerId: session.user.id,
        appointmentDate: parsed.data.appointmentDate,
        timeSlot: parsed.data.timeSlot,
        message: parsed.data.message,
      }),
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

  if (appointmentResponse.status === 409) {
    const conflict = (await appointmentResponse.json().catch(() => null)) as
      | { error?: string }
      | null
    return Response.json(
      { error: conflict?.error ?? "That date and time slot are already booked." },
      { status: 409 }
    )
  }

if (!appointmentResponse.ok) {
  const errorText = await appointmentResponse.text()

  console.error("Appointment API failed:", {
    status: appointmentResponse.status,
    response: errorText,
  })

  return Response.json(
    {
      error: "Appointment API failed",
      backendStatus: appointmentResponse.status,
      backendResponse: errorText,
    },
    { status: 502 }
  )
}

  // if (!appointmentResponse.ok) {
  //   return Response.json(
  //     { error: "The appointment API could not save this request." },
  //     { status: 502 }
  //   )
  // }

  const result = (await appointmentResponse.json().catch(() => null)) as
    | { ok?: boolean; id?: unknown }
    | null

  return Response.json(
    {
      ok: true,
      id: result?.id != null ? String(result.id) : null,
    },
    { status: 201 }
  )
}
