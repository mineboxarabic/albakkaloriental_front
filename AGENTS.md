<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AlimExpressCatalog Agent Guide

This repository is the standalone catalog front-end for AlimExpress / JardinVert. It serves the public retail catalog (B2C) and the wholesale professional portal (B2B).

> **Architecture note:** This front-end is a **pure REST API client** of the `AlimExpressApp` back-end. It does **not** own a database, a Prisma schema, or password hashing. Prisma/PostgreSQL are gone (Prisma is being removed entirely in Phase F.I). All data access goes through `lib/api-client.ts`.

## Back-end Integration

- All data flows through the back-end REST API at `BACKEND_URL` under `/api/v1/*`.
- Use `backendFetch` from `lib/api-client.ts` for every server-side call. It reads the JWT from the `catalog_session` cookie and forwards it as `Authorization: Bearer <token>`.
- Server actions in `actions/` are the preferred call site; avoid client-side fetches.
- Authentication (login, registration, password hashing) is owned by the back-end. This repo only stores and verifies the JWT it receives.

### Environment

- `BACKEND_URL` — server-only base URL of the AlimExpressApp back-end (required).
- `NEXT_PUBLIC_BACKEND_URL` — optional, only if a client-side fetch is unavoidable.
- `AUTH_SECRET` — shared JWT secret, **must equal** the back-end's signing secret. Used by `lib/session.ts` and `middleware.ts` to verify tokens locally.

## Product Scope

- **B2C retail catalog:** public browsing, retail auth, local cart, checkout, order tracking.
- **B2B wholesale portal:** admin-created professional accounts, tier prices C/D/E/F, local pro cart, quote/proforma validation, order history, invoices.

### Routes

The app uses route groups: `(public)`, `(retail)`, `(pro)`.

Public / retail (B2C):

- `/` — home
- `/products`, `/products/[id]`
- `/categories`, `/marques`
- `/cart`, `/checkout`
- `/login`
- `/register`, `/register/particulier`, `/register/entreprise`
- `/account`
- `/orders`, `/orders/[id]`
- `/forgot-password`, `/reset-password`, `/set-password`
- `/verify-email`, `/verify-pending`
- `/contact`, `/cgv`, `/confidentialite`

Professional (B2B), under `/pro/*`:

- `/pro` — pro home
- `/pro/login`
- `/pro/products`, `/pro/products/[id]`
- `/pro/categories`, `/pro/marques`
- `/pro/cart`
- `/pro/quotes`, `/pro/quotes/[id]` — devis / proforma
- `/pro/orders`, `/pro/orders/[id]`
- `/pro/invoices`
- `/pro/account`

## Auth & Middleware

- Auth lives in an HTTP-only cookie named `catalog_session` holding the back-end JWT.
- `middleware.ts` gates `/pro/*` (`matcher: ["/pro/:path*"]`).
- **Not all `/pro/*` is gated.** Browsing the wholesale catalog needs no login — public pro paths: `/pro`, `/pro/products` (+ `/pro/products/*`), `/pro/marques`, `/pro/categories`, `/pro/login`. Prices are stripped server-side for anonymous visitors.
- Everything else under `/pro/*` (cart, quotes, orders, invoices, account) requires a token with role `B2B_CLIENT` or `ADMIN`. Unauthenticated traffic redirects to `/pro/login?next=<path>`.
- JWT roles: `B2C_CLIENT` (retail), `B2B_CLIENT` / `ADMIN` (pro). See `lib/session.ts` for the session shapes.

## Business Rules

- Retail customers self-register (`/register`); registration collects name, email, phone, and address.
- B2B clients never self-register — `B2B_CLIENT` accounts are created by the admin app.
- Retail prices use `sellingPrice`.
- Wholesale prices resolve via `lib/catalog-pricing.ts` (`getTierPrice` / `resolveProPrice`) by the customer's pricing level C, D, E, or F. C = cheapest tier, F = most expensive.
- If a tier price is missing, fall back to `sellingPrice`.
- Pro sale units: `PACK` and `UNIT`. Unit price = tier price / `unitsPerPack`. Unit sale supported when `unitsPerPack > 1`.
- Order status: `PENDING` = devis / proforma, `CONFIRMED` = commande ferme.
- Carts are stored in `localStorage` via `components/cart-context.tsx`. Keys: `retail_cart` (B2C), `pro_cart` (B2B).
- Order thresholds live in `lib/order-rules.ts` — `MIN_ORDER_EUR=30`, `FREE_DELIVERY_THRESHOLD_EUR=50`, `DELIVERY_FEE_EUR=3`, `MAX_QTY_PER_PRODUCT=3`. Change values there only — never use magic numbers in components.

## Development Workflow

For each task:

1. Inspect existing code before editing.
2. Make the smallest coherent change.
3. Add or update tests when the task calls for them (run only the tests relevant to your change).
4. Run the narrowest useful verification first.
5. Run `npm run lint` before committing.

### Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build`
- `npm run lint`
- `npx vitest` — unit tests (no `test` npm script defined)
- `npx playwright test` — e2e

## Design Palette

| Use | Color | Hex |
| --- | ---: | ---: |
| Primary green | dark olive | `#3F561F` |
| Light background | warm off-white | `#FAF8F2` |
| Section beige | soft cream beige | `#F0EBDD` |
| Text black | near black | `#171717` |
| Secondary text | warm gray | `#6B665D` |
| Border | light beige-gray | `#DDD8CC` |
| Promo red | strong red-orange | `#D52B14` |
| Promo yellow | warm yellow | `#F2C400` |

- `#3F561F` for primary actions, active nav, important links, brand accents.
- `#FAF8F2` for the main app background.
- `#F0EBDD` for calm section backgrounds and grouped content zones.
- `#171717` for primary text, `#6B665D` for secondary text.
- `#DDD8CC` for borders, dividers, subtle outlines.
- Reserve `#D52B14` and `#F2C400` for promotions, warnings, highlights, price attention states.

## Security Notes

- JWT is held in the HTTP-only `catalog_session` cookie. Never expose the raw token or session internals to client components.
- Server actions must validate form data with `zod` before calling the back-end.
- Password hashing/verification is the back-end's responsibility — do not reimplement it here.

## Implementation Notes

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui (`@base-ui/react`), Zod, `jose` (JWT verification), date-fns, Vitest, Playwright. **No Prisma, no bcryptjs in this repo.**
- Respect the import alias `@/*`.
- Keep shared helpers in `lib/` (`api-client.ts`, `session.ts`, `catalog-pricing.ts`, `order-rules.ts`, `catalog.ts`).
- Keep server actions in `actions/`.
- Keep cart code in `components/cart-context.tsx`.
- Keep route-specific client components close to their route folder.
