"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  ImagePlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SERVICE_IMAGE_ACCEPT,
  SERVICE_IMAGE_HINT,
  formatFileSize,
  validateServiceImageFile,
} from "@/lib/services"
import { cn } from "cn"

type ServiceImageFieldProps = {
  file: File | null
  error?: string
  disabled?: boolean
  /** Called only with an image that passed client-side checks. */
  onSelect: (file: File) => void
  onRemove: () => void
  /** Called with a ready-to-display message when a file is rejected. */
  onReject: (message: string) => void
}

/**
 * Device image picker with an instant local preview.
 *
 * The preview is a `blob:` URL owned by this component, so it never leaves the
 * browser and can never be mistaken for a hosted image. The hosted URL is
 * produced by the upload step at submission time.
 */
export function ServiceImageField({
  file,
  error,
  disabled,
  onSelect,
  onRemove,
  onReject,
}: ServiceImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Release the last object URL when the form unmounts. Cleanup only — no
  // state is written here, so there is no cascading render.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  function replacePreview(next: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = next
    setPreviewUrl(next)
  }

  function acceptFile(next: File) {
    const message = validateServiceImageFile(next)

    if (message) {
      onReject(message)
      return
    }

    replacePreview(URL.createObjectURL(next))
    onSelect(next)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0]
    if (next) acceptFile(next)
    // Allow re-selecting the same file after removing it.
    event.target.value = ""
  }

  function removeImage() {
    replacePreview(null)
    onRemove()
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  const describedBy = error ? "service-image-error" : "service-image-hint"

  return (
    <div>
      <input
        ref={inputRef}
        id="service-image"
        name="service-image"
        type="file"
        accept={SERVICE_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={handleInputChange}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-brand-cream/30">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={previewUrl}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="object-cover"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/65 via-black/10 to-transparent p-3">
            <div className="pointer-events-auto min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {file?.name ?? "Selected image"}
              </p>
              {file ? (
                <p className="text-[0.65rem] text-white/70">
                  {formatFileSize(file.size)}
                </p>
              ) : null}
            </div>

            <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={openPicker}
                disabled={disabled}
                aria-label="Replace image"
                className="size-9 rounded-full"
              >
                <RefreshCwIcon />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={removeImage}
                disabled={disabled}
                aria-label="Remove image"
                className="size-9 rounded-full text-destructive hover:text-destructive"
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          id="service-image-trigger"
          onClick={openPicker}
          disabled={disabled}
          aria-describedby={describedBy}
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            const next = event.dataTransfer.files?.[0]
            if (next && !disabled) acceptFile(next)
          }}
          className={cn(
            "group flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed bg-brand-cream/25 px-4 py-8 text-center transition-colors outline-none",
            "focus-visible:border-brand-gold focus-visible:ring-3 focus-visible:ring-brand-gold/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isDragging
              ? "border-brand-gold bg-brand-cream/70"
              : "border-brand-gold/35 hover:border-brand-gold hover:bg-brand-cream/55",
            error ? "border-destructive/60" : null
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-brand-gold/30 bg-background/80 text-brand-plum transition-colors group-hover:border-brand-gold/60">
            <UploadCloudIcon className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Upload a service photo
          </span>
          <span className="text-xs text-muted-foreground">
            Drag &amp; drop, or click to browse
          </span>
          <span className="text-[0.58rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
            {SERVICE_IMAGE_HINT}
          </span>
        </button>
      )}

      <div className="mt-2 flex items-center justify-between gap-3">
        <p id="service-image-hint" className="text-xs text-muted-foreground">
          {previewUrl
            ? "This is a local preview — the image is hosted when the service is saved."
            : "A clear, well-lit photo works best on the service card."}
        </p>

        {previewUrl ? (
          <span className="flex shrink-0 items-center gap-1 text-[0.6rem] font-medium tracking-[0.16em] text-brand-plum/70 uppercase">
            <ImagePlusIcon className="size-3" />
            Ready
          </span>
        ) : null}
      </div>
    </div>
  )
}
