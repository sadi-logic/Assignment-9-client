export type TransactionRow = {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  appointmentDate: string
  amount: number
  currency: string
  stripeSessionId: string
  paymentStatus: string
  createdAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseTransactionList(input: unknown): TransactionRow[] {
  if (!Array.isArray(input)) return []

  return input.flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      typeof value.amount !== "number" ||
      !Number.isFinite(value.amount)
    ) {
      return []
    }

    return [{
      id: value.id,
      customerName:
        typeof value.customerName === "string"
          ? value.customerName
          : "Unknown customer",
      customerEmail:
        typeof value.customerEmail === "string" ? value.customerEmail : "",
      serviceName:
        typeof value.serviceName === "string"
          ? value.serviceName
          : "Service unavailable",
      appointmentDate:
        typeof value.appointmentDate === "string" ? value.appointmentDate : "",
      amount: value.amount,
      currency:
        typeof value.currency === "string" ? value.currency.toUpperCase() : "",
      stripeSessionId:
        typeof value.stripeSessionId === "string" ? value.stripeSessionId : "",
      paymentStatus:
        typeof value.paymentStatus === "string" ? value.paymentStatus : "unknown",
      createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    }]
  })
}

export function formatTransactionAmount(amount: number, currency: string) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return currency ? `${formattedAmount} ${currency}` : formattedAmount
}

export function formatTransactionDate(value: string) {
  if (!value) return "Date unavailable"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
