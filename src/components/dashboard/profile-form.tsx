"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { isValidImageUrl } from "@/lib/validation"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "SB"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function ProfileForm({
  name: initialName,
  email,
  image: initialImage,
}: {
  name: string
  email: string
  image: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [image, setImage] = useState(initialImage)
  const [isSaving, setIsSaving] = useState(false)
  const previewImage = isValidImageUrl(image) ? image.trim() : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (name.trim().length < 2) {
      toast.error("Enter a name with at least two characters.")
      return
    }
    if (image.trim() && !isValidImageUrl(image)) {
      toast.error("Use a full image URL starting with http:// or https://.")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      })

      if (error) {
        toast.error(error.message || "Your profile could not be updated.")
        return
      }

      toast.success("Your profile has been updated.")
      router.refresh()
    } catch {
      toast.error("Your profile could not reach the server.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-7"
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-14 ring-1 ring-brand-gold/40">
          {previewImage ? <AvatarImage src={previewImage} alt="" /> : null}
          <AvatarFallback className="bg-brand-cream font-display text-brand-plum">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{name || "Your profile"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            autoComplete="name"
            value={name}
            disabled={isSaving}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email address</Label>
          <Input id="profile-email" type="email" value={email} disabled />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-image">Profile image URL</Label>
          <Input
            id="profile-image"
            type="url"
            inputMode="url"
            placeholder="https://example.com/photo.jpg"
            value={image}
            disabled={isSaving}
            onChange={(event) => setImage(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Paste a direct image link, or leave it empty to remove your photo.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isSaving} className="mt-6 rounded-full">
        {isSaving ? (
          <>
            <Loader2Icon className="animate-spin" />
            Saving
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  )
}
