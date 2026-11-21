export const PASSWORD_MIN_LENGTH = 6

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 6 characters and include an uppercase and a lowercase letter."

export const BLOCKED_ACCOUNT_MESSAGE =
  "This account has been blocked. Please contact the salon if you think this is a mistake."

export function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  }
}

export function isStrongPassword(password: string) {
  const checks = getPasswordChecks(password)
  return checks.minLength && checks.uppercase && checks.lowercase
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

export function isValidImageUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
