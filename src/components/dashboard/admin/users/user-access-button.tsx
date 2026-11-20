"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function UserAccessButton({
  userId,
  isBlocked,
}: {
  userId: string
  isBlocked: boolean
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const nextIsBlocked = !isBlocked

  async function updateAccess() {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isBlocked: nextIsBlocked }),
      })
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        toast.error(payload?.error ?? "Could not update this customer's access.")
        return
      }

      toast.success(
        nextIsBlocked
          ? "Customer access blocked."
          : "Customer access restored."
      )
      router.refresh()
    } catch {
      toast.error("The customer access update could not reach the server.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      type="button"
      variant={isBlocked ? "default" : "outline"}
      size="sm"
      disabled={isSaving}
      onClick={() => void updateAccess()}
      className="min-w-24 rounded-full"
    >
      {isSaving ? (
        <>
          <Loader2Icon className="animate-spin" />
          Saving
        </>
      ) : isBlocked ? (
        "Unblock"
      ) : (
        "Block"
      )}
    </Button>
  )
}
