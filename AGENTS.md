<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# salonbook-client

Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui client app. Run everything from the repo root; `npm` with `package-lock.json` is canonical.

## Commands

- `npm run dev` — Turbopack dev server on `:3000`.
- `npm run build` / `npm start` — production build and serve.
- `npm run lint` — `eslint` with no arguments (flat config, `eslint.config.mjs`). Scope it with `npm run lint -- src/app`.
- Typecheck: `npx tsc --noEmit` — there is no `typecheck` script.
- No test runner, CI, or pre-commit hooks are configured. Do not invent test commands.

## Non-obvious constraints

- **Cache Components are enabled** (`cacheComponents: true`, `partialPrefetching: true`, `reactCompiler: true` in `next.config.ts`). Use the new model (`use cache`, Suspense around dynamic data) rather than legacy `export const dynamic` / `revalidate`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before touching data fetching.
- **Tailwind v4 is CSS-first.** There is no `tailwind.config.js`; theme tokens live in `src/app/globals.css` under `@theme inline`, and CSS is piped through the `@tailwindcss/turbopack` loader declared in `next.config.ts`. Add tokens in the CSS, not a JS config.
- **shadcn uses the `base-nova` style**, so `src/components/ui/*` wrap `@base-ui/react` primitives, not Radix. Add components with `npx shadcn@latest add <name>` (reads `components.json`); keep the generated `@base-ui/react` imports.
- **`cn` comes from the `cn` package**, a drop-in replacement for `clsx` + `tailwind-merge`. Import it from `@/lib/utils` or `"cn"` directly — do not write the usual clsx/twMerge helper.
- **Route typing is generated.** `layout.tsx` uses `LayoutProps<"/">`; these globals come from `.next/types` and only exist after `next dev` or `next build`. Use `PageProps<"/route">` instead of hand-rolled param types.

## Layout

- `src/app/**` — App Router routes (`layout.tsx`, `page.tsx`, `globals.css`).
- `src/components/ui/**` — shadcn-generated components.
- `src/lib/**` — utilities; `@/*` maps to `./src/*` per `tsconfig.json`.
- `.env` is present but empty and gitignored (`.env*`).
