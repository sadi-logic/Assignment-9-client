import {
  toServicePayload,
  type ServiceDraft,
  type ServiceFieldErrors,
  type ServiceFormValues,
} from "@/lib/services"

export type PublishServiceResult = { id: string | null; draft: ServiceDraft }


export class ServicePublishError extends Error {
  readonly fieldErrors?: ServiceFieldErrors

  constructor(message: string, fieldErrors?: ServiceFieldErrors) {
    super(message)
    this.name = "ServicePublishError"
    this.fieldErrors = fieldErrors
  }
}

type ErrorBody = { error?: string; errors?: ServiceFieldErrors }

async function readErrorBody(response: Response): Promise<ErrorBody | null> {
  try {
  
    const raw = await response.text()
    return JSON.parse(raw) as ErrorBody
  } catch {
    return null
  }
}


export async function publishService(
  values: ServiceFormValues,
  imageFile: File
): Promise<PublishServiceResult> {
  // 1. Host the image first — `image` must be a hosted URL, never a blob:.
  const uploadBody = new FormData()
  uploadBody.append("image", imageFile, imageFile.name)

  let uploadResponse: Response
  try {
    uploadResponse = await fetch("/api/admin/services/image", {
      method: "POST",
      body: uploadBody,
    })
  } catch {
    throw new ServicePublishError(
      "Could not reach the server to upload the image. Check your connection."
    )
  }

  if (!uploadResponse.ok) {
    const body = await readErrorBody(uploadResponse)
    throw new ServicePublishError(
      body?.error?.trim() || "The image could not be uploaded. Nothing was saved."
    )
  }

  const upload = (await uploadResponse.json().catch(() => null)) as {
    url?: string
  } | null

  const imageUrl = upload?.url?.trim()
  if (!imageUrl) {
    throw new ServicePublishError(
      "The image upload did not return a URL. Nothing was saved."
    )
  }

  // 2. Build the typed document (throws if the values are unusable).
  const payload = toServicePayload(values, imageUrl)

  let createResponse: Response
  try {
    createResponse = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ServicePublishError(
      "The image was uploaded, but the service could not be sent. Please retry."
    )
  }

  if (!createResponse.ok) {
    const body = await readErrorBody(createResponse)
    throw new ServicePublishError(
      body?.error?.trim() || "The service could not be created. Nothing was saved.",
      body?.errors
    )
  }

  const created = (await createResponse.json().catch(() => null)) as {
    id?: string | null
  } | null

  return { id: created?.id ?? null, draft: payload }
}
