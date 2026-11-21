import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ReceiptTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { BACKEND_UNAVAILABLE_MESSAGE, backendAuthHeader, backendFetch } from "@/lib/backend"
import { dashboardForRole, routes } from "@/lib/site"
import {
  formatTransactionAmount,
  formatTransactionDate,
  parseTransactionList,
  type TransactionRow,
} from "@/lib/transactions"

export const metadata: Metadata = {
  title: "Transactions",
  description: "Review SalonBook payment transactions.",
}

export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsContent />
    </Suspense>
  )
}

async function TransactionsContent() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user) redirect(routes.signIn)
  if (session.user.role !== "admin") {
    redirect(dashboardForRole(session.user.role))
  }
  if (session.user.isBlocked) redirect(routes.home)

  let transactions: TransactionRow[] = []
  let error: string | null = null

  try {
    const response = await backendFetch("/admin/transactions", {
      method: "GET",
      headers: { ...backendAuthHeader(session.session.token) },
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      error =
        payload?.error ??
        `The transactions API answered with status ${response.status}.`
    } else {
      const payload: unknown = await response.json()
      if (Array.isArray(payload)) {
        transactions = parseTransactionList(payload)
      } else {
        error = "The transactions API returned an unexpected response."
      }
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
        <ReceiptTextIcon aria-hidden className="size-3.5" />
        Payment records
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">
        Transactions.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Review payment status and Stripe references. Payment records are updated
        only by verified Stripe events, not manually by an administrator.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-5 text-sm text-muted-foreground"
        >
          <p className="font-medium text-destructive">Could not load transactions</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <p
          role="status"
          className="mt-8 rounded-2xl border border-border/70 bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground"
        >
          No payment transactions have been recorded yet.
        </p>
      ) : (
        <section
          aria-label="Payment transactions"
          className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60"
        >
          <div className="border-b border-border/70 px-4 py-3 text-xs text-muted-foreground">
            {transactions.length === 1
              ? "1 transaction"
              : `${transactions.length} transactions`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Appointment</th>
                  <th scope="col" className="px-4 py-3 font-medium">Amount</th>
                  <th scope="col" className="px-4 py-3 font-medium">Stripe reference</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Transaction date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {transaction.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {transaction.serviceName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {transaction.appointmentDate || "Unavailable"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatTransactionAmount(
                        transaction.amount,
                        transaction.currency
                      )}
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-muted-foreground"
                      title={transaction.stripeSessionId}
                    >
                      {transaction.stripeSessionId
                        ? `…${transaction.stripeSessionId.slice(-12)}`
                        : "Unavailable"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {transaction.paymentStatus}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTransactionDate(transaction.createdAt)}
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

function TransactionsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse" aria-hidden>
      <div className="h-3 w-36 rounded-full bg-muted" />
      <div className="mt-4 h-10 w-80 max-w-full rounded-lg bg-muted" />
      <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-muted" />
      <div className="mt-8 h-64 rounded-2xl bg-muted/60" />
    </div>
  )
}
