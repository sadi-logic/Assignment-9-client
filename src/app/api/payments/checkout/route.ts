import { auth } from "@/lib/auth"
import {
  BACKEND_UNAVAILABLE_MESSAGE,
  backendAuthHeader,
  backendFetch,
} from "@/lib/backend"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return Response.json({ error: "Sign in to pay for an appointment." }, { status: 401 })
  }

  if (session.user.role !== "customer") {
    return Response.json(
      { error: "Only customers can pay for appointments." },
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
    return Response.json({ error: "Send the appointment as JSON." }, { status: 400 })
  }

  const appointmentId =
    body && typeof body === "object" && "appointmentId" in body
      ? body.appointmentId
      : null
  if (typeof appointmentId !== "string" || !/^[a-f\d]{24}$/i.test(appointmentId)) {
    return Response.json({ error: "Invalid appointment ID." }, { status: 400 })
  }

  let response: Response
  try {
    response = await backendFetch("/payments/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...backendAuthHeader(session.session.token),
      },
      body: JSON.stringify({ appointmentId }),
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

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; url?: string }
    | null

  if (!response.ok) {
    return Response.json(
      { error: payload?.error ?? "Checkout could not be started." },
      { status: response.status }
    )
  }

  if (!payload?.url) {
    return Response.json(
      { error: "The payment API did not return a checkout link." },
      { status: 502 }
    )
  }

  let checkoutUrl: URL
  try {
    checkoutUrl = new URL(payload.url)
  } catch {
    return Response.json(
      { error: "The payment API returned an invalid checkout link." },
      { status: 502 }
    )
  }

  if (
    checkoutUrl.protocol !== "https:" ||
    checkoutUrl.hostname !== "checkout.stripe.com"
  ) {
    return Response.json(
      { error: "The payment API returned an untrusted checkout link." },
      { status: 502 }
    )
  }

  return Response.json({ url: checkoutUrl.href }, { status: 201 })
}
