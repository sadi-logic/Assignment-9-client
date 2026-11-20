import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UserAccessButton } from "@/components/dashboard/admin/users/user-access-button"
import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import { dashboardForRole, routes } from "@/lib/site"
import { isUserRole, ROLE_LABELS, type UserRole } from "@/lib/roles"

type UserSummary = {
  id: string
  name: string
  email: string
  role: UserRole
  isBlocked: boolean
}

export default function ManageUsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <ManageUsersContent />
    </Suspense>
  )
}

async function ManageUsersContent() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) redirect(routes.signIn)
  if (session.user.role !== "admin") {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  let users: UserSummary[] = []
  let error: string | null = null

  try {
    const response = await backendFetch("/users", {
      method: "GET",
      headers: { cookie: requestHeaders.get("cookie") ?? "" },
    })

    if (!response.ok) {
      error = `The users API answered with status ${response.status}.`
    } else {
      const payload: unknown = await response.json()
      if (Array.isArray(payload)) {
        users = payload
          .map(toUserSummary)
          .filter((user): user is UserSummary => user !== null)
      }
      else error = "The users API returned an unexpected response."
    }
  } catch (requestError) {
    error =
      requestError instanceof Error && requestError.message
        ? requestError.message
        : BACKEND_UNAVAILABLE_MESSAGE
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      <p className="inline-flex items-center gap-2 text-[0.6rem] font-medium tracking-[0.3em] text-brand-gold uppercase">
        <UsersIcon aria-hidden className="size-3.5" />
        Salon management
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">
        Manage users.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Review registered customers and manage their platform access. Roles are
        assigned securely and cannot be changed here.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-5 text-sm text-muted-foreground"
        >
          <p className="font-medium text-destructive">Could not load users</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <p
          role="status"
          className="mt-8 rounded-2xl border border-border/70 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground"
        >
          No customer accounts were found.
        </p>
      ) : (
        <section
          aria-label="User accounts"
          className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60"
        >
          <div className="border-b border-border/70 px-4 py-3 text-xs text-muted-foreground">
            {users.length === 1 ? "1 customer" : `${users.length} customers`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Access</th>
                  <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ROLE_LABELS[user.role]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.isBlocked ? "Blocked" : "Active"}
                    </td>
                    <td className="px-4 py-3">
                      <UserAccessButton
                        userId={user.id}
                        isBlocked={user.isBlocked}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/70 px-4 py-3">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={routes.adminDashboard} />}
              className="h-9 rounded-full px-4 text-[0.6rem] tracking-[0.16em] uppercase"
            >
              Back to overview
            </Button>
          </div>
        </section>
      )}
    </main>
  )
}

function toUserSummary(value: unknown): UserSummary | null {
  if (!isRecord(value) || Array.isArray(value)) return null
  const id = value._id
  if (typeof id !== "string") return null

  const record = value
  const role = isUserRole(record.role) ? record.role : "customer"

  return {
    id,
    name: typeof record.name === "string" ? record.name : "Unnamed user",
    email: typeof record.email === "string" ? record.email : "No email",
    role,
    isBlocked: record.isBlocked === true,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function UsersSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse" aria-hidden>
      <div className="h-3 w-36 rounded-full bg-muted" />
      <div className="mt-4 h-10 w-80 max-w-full rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
      <div className="mt-8 h-64 rounded-2xl bg-muted/60" />
    </div>
  )
}
