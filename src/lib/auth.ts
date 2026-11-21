import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

import {
  BLOCKED_ACCOUNT_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  isStrongPassword,
} from "@/lib/validation"

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is not set. Add your MongoDB connection string to .env."
  )
}

const globalForMongo = globalThis as typeof globalThis & {
  salonBookMongoClient?: MongoClient
}
const client =
  globalForMongo.salonBookMongoClient ??
  new MongoClient(mongoUri, { maxPoolSize: 10 })
globalForMongo.salonBookMongoClient = client
// Keep the database explicit: an Atlas URI usually carries no database path,
// and `client.db()` would then silently use a database named "test".
const dbName = process.env.MONGODB_DB_NAME?.trim() || "salonbookdb"
const db = client.db(dbName)

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},

  database: mongodbAdapter(db, {
    client,
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Second line of defence behind the form validation: the password
      // policy is enforced on the server for every email/password sign up.
      if (ctx.path !== "/sign-up/email") return

      const password = (ctx.body as { password?: unknown } | undefined)?.password

      if (typeof password !== "string" || !isStrongPassword(password)) {
        throw new APIError("BAD_REQUEST", {
          message: PASSWORD_POLICY_MESSAGE,
        })
      }
    }),
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          try {
            const user = await ctx?.context.internalAdapter.findUserById(
              session.userId
            )

            if (user && (user as { isBlocked?: boolean }).isBlocked) {
              throw new APIError("FORBIDDEN", {
                message: BLOCKED_ACCOUNT_MESSAGE,
              })
            }
          } catch (error) {
            if (error instanceof APIError) throw error
            
          }
        },
      },
    },
  },
})

export async function connectMongo() {
  await client.connect()
}

export async function getAuthSession(headers: Headers) {
  await connectMongo()
  return auth.api.getSession({ headers })
}
