import { isValidImageUrl } from "@/lib/validation"
import { getAuthSession } from "@/lib/auth"
import { validateServiceImageFile } from "@/lib/services"

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload"

type ImgbbResponse = {
  success?: boolean
  data?: { url?: string; display_url?: string }
  error?: { message?: string }
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

/**
 * Hosts one service photo on ImgBB.
 *
 * The API key is read from the server environment and never leaves this
 * handler, so it cannot be scraped from the browser bundle or a network tab.
 * Admin rights are checked here rather than trusting the page that mounted the
 * form — this route is callable directly.
 */
export async function POST(request: Request) {
  const session = await getAuthSession(request.headers)

  if (!session?.user) {
    return jsonError("Sign in to upload a service image.", 401)
  }

  if (session.user.role !== "admin") {
    return jsonError("Only administrators can upload service images.", 403)
  }

  if (session.user.isBlocked) {
    return jsonError("This account is blocked.", 403)
  }

  const apiKey = process.env.IMGBB_API_KEY?.trim()
  if (!apiKey) {
    return jsonError(
      "Image hosting is not configured. Add IMGBB_API_KEY to the server environment.",
      503
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return jsonError("Send the image as multipart form data.", 400)
  }

  const entry = form.get("image")
  if (!(entry instanceof File)) {
    return jsonError('Attach the image in the "image" field.', 400)
  }

  // Re-checked on the server: a hand-crafted request skips the browser checks.
  const fileError = validateServiceImageFile(entry)
  if (fileError) {
    return jsonError(fileError, 422)
  }

  const upstreamForm = new FormData()
  upstreamForm.append("image", entry, entry.name || "service-image")

  let upstream: Response
  try {
    upstream = await fetch(
      `${IMGBB_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: upstreamForm,
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      }
    )
  } catch {
    return jsonError("ImgBB could not be reached. Please try again.", 502)
  }

  const payload = (await upstream.json().catch(() => null)) as ImgbbResponse | null

  if (!upstream.ok || !payload?.success) {
    return jsonError(
      payload?.error?.message?.trim() ||
        "ImgBB rejected the upload. Please try another image.",
      502
    )
  }

  // `url` is the direct file link; `display_url` is the fallback.
  const url = payload.data?.url?.trim() || payload.data?.display_url?.trim() || ""

  if (!isValidImageUrl(url)) {
    return jsonError("ImgBB did not return a usable image URL.", 502)
  }

  return Response.json({ url }, { status: 201 })
}
