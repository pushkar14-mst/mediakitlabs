# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # start dev server (Turbopack, localhost:3000)
pnpm build      # production build (Turbopack by default)
pnpm start      # serve production build
pnpm lint       # run ESLint
```

There are no tests configured.

## Architecture

Early-stage Next.js 16 app using the **App Router** exclusively. No Pages Router.

**General Stack:**

- Next.js 16 + React 19.2 — App Router, Server Components by default
- TypeScript, Tailwind CSS v4, shadcn/ui (radix-lyra style)
- Prisma (ORM), iron-session (auth), Resend + react-email (transactional email)
- Zod (validation), SWR (client-side data fetching), lucide-react (icons)

### API routes

- `withSessionRoute` wraps **every** protected route — never access session without it
- **GET and POST only** — no PUT, PATCH, DELETE
- Mutations go to sub-paths: `/api/rate-cards/save`, `/api/rate-cards/delete`
- **Zod validation on every POST body** — reject before any DB call
- `getUserObject` from `lib/api.ts` on every protected route to validate session and get full user
- Use shared response helpers from `lib/api.ts` — `unauthorized()`, `badRequest()`, `notFound()`, `forbidden()`, `serverError()`
- **Zero Prisma calls inside `app/` directory** — server components included. All data goes through API routes

### Client

- `useSWR` for all passive data fetching (benchmarks, saved cards, user)
- `useSWRMutation` for all triggered actions (calculate, save, delete)
- `use-debounce` at 300ms on all sliders before firing API calls
- Optimistic UI: run `calculateRateClient` from `lib/rate-engine.ts` synchronously for instant preview, then confirm with API result

### Auth

- iron-session only — `SESSION_OPTIONS` and all helpers live in `lib/session.ts`
- Cookie name: `colabrate_session`
- Passwords hashed with bcrypt, 12 salt rounds
- `middleware.ts` guards all routes via `unsealData` — public paths explicitly listed

### Types

- All shared types in `types/index.ts` — never define types inline in components or routes
- Import types with `import type` where possible

### Comments

- **Every exported function gets a JSDoc block:**

```ts
/**
 * One-line description of what this does.
 * @param paramName - What this param represents
 * @returns What this returns
 */
```

- Internal helper functions with non-obvious logic also get JSDoc, exceptions are withSessionRoute ussage

## Tech-Stack

| Layer         | Choice                                     |
| ------------- | ------------------------------------------ |
| Framework     | Next.js 15, App Router, Turbopack          |
| Language      | TypeScript (strict mode)                   |
| Styling       | Tailwind CSS v4 + shadcn/ui                |
| Icons         | react-icons                                |
| Data fetching | SWR + useSWRMutation + use-debounce        |
| Auth          | iron-session (own register/login + bcrypt) |
| ORM           | Prisma (MongoDB provider)                  |
| Database      | MongoDB Atlas                              |
| Cache         | Upstash Redis (HTTP client)                |
| PDF           | @react-pdf/renderer (client-side)          |
| Email         | Resend + react-email                       |
| Validation    | Zod                                        |
| Deploy        | Vercel                                     |
| Analytics     | PostHog                                    |
| Errors        | Sentry                                     |

**Path alias:** `@/` maps to project root.

---

## Folder Structure

```
mediakitlab/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # protected app shell with navbar
│   │   ├── page.tsx                # main calculator page
│   │   └── saved/page.tsx          # saved rate cards
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── rate/
│   │   │   └── calculate/route.ts  # POST — core rate engine
│   │   ├── rate-cards/
│   │   │   ├── route.ts            # GET — all saved cards
│   │   │   ├── save/route.ts       # POST — save a card
│   │   │   └── delete/route.ts     # POST — delete by id
│   │   ├── benchmarks/
│   │   │   └── route.ts            # GET — benchmark config (public, cached)
│   │   └── pdf/
│   │       └── generate/route.ts   # POST — generate PDF
│   └── layout.tsx                  # root layout
├── components/
│   ├── ui/                         # shadcn components only — never edit manually
│   ├── calculator/
│   │   ├── RateCalculator.tsx
│   │   ├── PlatformSelector.tsx
│   │   ├── NicheSelector.tsx
│   │   ├── FollowerSlider.tsx
│   │   ├── ERSlider.tsx
│   │   └── RateCardOutput.tsx
│   ├── rate-cards/
│   │   ├── SavedCardList.tsx
│   │   └── SavedCardItem.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── AuthButtons.tsx
├── lib/
│   ├── session.ts                  # iron-session config, withSessionRoute, getUserSSR
│   ├── prisma.ts                   # Prisma singleton
│   ├── api.ts                      # response helpers + getUserObject + parseBody
│   ├── auth.ts                     # buildLogout, getCachedUser, invalidateUserCache
│   ├── redis.ts                    # Upstash Redis client
│   ├── rate-engine.ts              # pure TS formula — no Next.js imports
│   └── benchmarks.ts              # three-layer cached benchmark loader
├── hooks/
│   ├── useRate.ts                  # useSWRMutation for rate calculation
│   ├── useRateCards.ts             # useSWR for saved cards
│   └── useBenchmarks.ts           # useSWR for benchmark config
├── types/
│   └── index.ts                    # all shared types — single source of truth
├── prisma/
│   └── schema.prisma
└── middleware.ts
```

---

**Path alias:** `@/` maps to the project root.

## Next.js 16 Breaking Changes to Know

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now fully async. Always `await` them:

```ts
// pages and layouts receive params as a Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

Run `npx next typegen` to auto-generate `PageProps`, `LayoutProps`, `RouteContext` helpers.

**Turbopack is the default** for both `next dev` and `next build`. Custom webpack config will break the build — use `next build --webpack` to opt out if needed.

**Caching API changes:**

- `revalidateTag(tag, cacheLifeProfile)` now requires a second argument (e.g. `'max'`)
- Use `updateTag` in Server Actions for read-your-writes semantics (immediate refresh)
- `cacheLife` and `cacheTag` are stable — no more `unstable_` prefix

**Config changes:** `experimental.turbopack` moved to top-level `turbopack: {}` in `next.config.ts`.

---

## Key Files Reference

### `lib/session.ts`

- `SESSION_OPTIONS` — iron-session config
- `withSessionRoute(handler)` — HOC for protected API routes
- `getUserSSR(cookies)` — server component session fetch, redirects if missing
- `getUserSSRNoRedirect(cookies)` — server component session fetch, returns null if missing
- `isLoggedIn(cookies)` — boolean session check for server components
- `SessionData`, `UserData` — session types

### `lib/api.ts`

- `getUserObject(req)` — validates session + fetches full user from Redis/DB
- `parseBody(req, schema)` — parses and Zod-validates POST body
- `isValidObjectId(id)` — validates MongoDB ObjectId format
- `unauthorized()`, `notFound()`, `forbidden()`, `badRequest()`, `serverError()` — response helpers

### `lib/auth.ts`

- `buildLogout(req)` — destroys session and redirects to /login
- `getCachedUser(userId)` — Redis-cached user fetch
- `invalidateUserCache(userId)` — clears user from Redis cache

### `lib/rate-engine.ts`

- `calculateRate(inputs, benchmarks)` — full rate calculation with breakdown
- `calculateRateClient(inputs, benchmarks)` — lightweight client-side version for optimistic UI
- `getRateInsights(inputs, benchmarks)` — human-readable "why this rate" strings
- `getCreatorTier(followers)` — nano/micro/mid/macro/mega label

### `lib/benchmarks.ts`

- `getBenchmarks()` — three-layer cached benchmark config loader, seeds DB on first deploy
- `invalidateBenchmarkCache()` — clears memory + Redis cache

---

## Prisma Models

```
User         — id, email, name, password (bcrypt), avatarUrl, createdAt, updatedAt
RateCard     — id, userId, platform, niche, followers, engagementRate, city, deliverable,
               floorRate, midRate, premiumRate, label, createdAt, updatedAt
Benchmark    — id, version, data (Json), createdAt, updatedAt
```

- `npx prisma db push` to sync schema — no migration files with MongoDB
- `npx prisma generate` after every schema change before running dev server

---

## Styling

Tailwind v4 (imported via `@import "tailwindcss"` in `globals.css`). Theme tokens are CSS custom properties using oklch color space, defined in `globals.css`. Dark mode uses the `.dark` class variant. Extend the theme inside `@theme inline {}` in `globals.css`.

Fonts: DM Sans (`--font-sans`, primary), Geist Sans (`--font-geist-sans`), Geist Mono (`--font-geist-mono`) — all loaded via `next/font/google` in `app/layout.tsx`.

## shadcn/ui

Components use the `radix-lyra` style. Add new components with:

```bash
pnpm shadcn add <component-name>
```

The `Button` component uses `Slot.Root` from `radix-ui` (not `@radix-ui/react-slot`) — the project imports directly from `radix-ui`.

## What NOT to Do

- No PUT / PATCH / DELETE HTTP methods
- No Prisma calls in `app/` directory (server components or layouts)
- No hardcoded multipliers in components — always fetch from `getBenchmarks()`
- No `console.log` in production code paths
- No inline type definitions — all types go in `types/index.ts`
