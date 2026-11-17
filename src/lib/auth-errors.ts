import {
  BLOCKED_ACCOUNT_MESSAGE,
  PASSWORD_POLICY_MESSAGE,
} from "@/lib/validation"

type AuthErrorLike =
  | {
      code?: string
      message?: string
      status?: number
    }
  | null
  | undefined

/**
 * Turns a Better Auth error into copy a customer can act on, instead of
 * leaking raw API messages such as "Invalid email or password."
 */
export function getAuthErrorMessage(error: AuthErrorLike, fallback: string) {
  if (!error) return fallback

  switch (error.code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Try signing in instead."
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password combination does not match our records."
    case "INVALID_EMAIL":
      return "Please enter a valid email address."
    case "PASSWORD_TOO_SHORT":
      return PASSWORD_POLICY_MESSAGE
    case "PASSWORD_TOO_LONG":
      return "That password is too long. Please use a shorter one."
    case "BANNED_USER":
    case "FORBIDDEN":
      return BLOCKED_ACCOUNT_MESSAGE
    case "INVALID_ORIGIN":
      return "This request came from an unexpected origin. Please refresh and try again."
    default:
      return error.message?.trim() || fallback
  }
}
