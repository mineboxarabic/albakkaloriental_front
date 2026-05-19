<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AlimExpressCatalog Agent Guide

This repository is the standalone catalog portal for AlimExpress / JardinVert. It serves both the public retail catalog and the protected wholesale professional portal.

## Product Scope

Build and maintain these user experiences:

- B2C retail catalog: public browsing, retail auth, local cart, checkout, order tracking.
- B2B wholesale portal: admin-created professional accounts, tier prices C/D/E/F, local pro cart, proforma validation, order history, invoices placeholder.
- Shared database access through PostgreSQL and Prisma Client.

Primary routes:

- `/`
- `/products`
- `/products/[id]`
- `/cart`
- `/checkout`
- `/register`
- `/login`
- `/orders/[id]`
- `/pro/login`
- `/pro/products`
- `/pro/products/[id]`
- `/pro/cart`
- `/pro/proforma/[id]`
- `/pro/orders`
- `/pro/invoices`

## Non-Negotiable Database Rules

- Never run `prisma migrate`, `prisma migrate dev`, `prisma db push`, or any command that mutates the shared schema from this project.
- Migrations are owned by `AlimExpressApp`.
- Only `npx prisma generate` is allowed here.
- The Prisma schema in this repo must be a subset that matches the existing `AlimExpressApp` database exactly.
- When the subset schema disagrees with the admin app schema, update this repo to match the admin app.

## Business Rules

- Retail customers self-register with phone and password.
- B2B clients never self-register. Their `B2B_CLIENT` accounts are created by the admin app.
- Retail prices use `Product.sellingPrice`.
- Wholesale prices use the connected customer's `pricingLevel`: C, D, E, or F.
- If a tier price is missing, fall back to `sellingPrice`.
- Wholesale orders reuse the existing `Order` model.
- `OrderStatus.PENDING` means devis / proforma.
- `OrderStatus.CONFIRMED` means commande ferme.
- `/pro/*` routes must be protected by middleware.
- Unauthenticated professional traffic redirects to `/pro/login`.
- Retail cart key: `retail_cart`.
- Professional cart key: `pro_cart`.

## Development Workflow

Work task-by-task from `backlog.md`.

For each task:

1. Read the relevant backlog section.
2. Inspect existing code before editing.
3. Make the smallest coherent change.
4. Add or update tests when the task calls for them.
5. Run the narrowest useful verification first.
6. Run `npm run lint` before committing.
7. Commit with the message specified in `backlog.md` when the task is complete.

## Test Commands

Use these commands as the project grows:

```bash
npm run lint
npm run build
npx vitest run
npx playwright test --reporter=list
```

Run Playwright only after the relevant pages and test setup exist.

## UI Conventions

- Use App Router server components for data fetching when possible.
- Use client components for cart actions and interactive forms.
- Prefer shadcn/ui components already installed in `components/ui`.
- Keep retail styling green and approachable.
- Keep pro styling more operational and business-focused.
- Do not create marketing-only pages where a functional catalog view is expected.

## Security Notes

- Store auth in HTTP-only JWT cookies named `catalog_session`.
- Use `jose` for signing and verifying JWTs.
- Use `bcryptjs` for password hashing and verification.
- Do not expose password hashes or sensitive session details to client components.
- Server actions must validate form data with `zod` before writing to the database.

## Implementation Notes

- The project uses Next.js 15, TypeScript, Tailwind, shadcn/ui, Prisma, Zod, jose, bcryptjs, date-fns, Vitest, and Playwright.
- Respect the import alias `@/*`.
- Keep shared helpers in `lib/`.
- Keep server actions in `actions/`.
- Keep cart code in `components/cart-context.tsx`.
- Keep route-specific client components close to their route folder.

## Completion Standard

A change is complete only when:

- the CDC behavior is represented;
- the relevant backlog items are checked or clearly left pending;
- Prisma migration rules are respected;
- lint and relevant tests pass;
- the working tree is clean after commit.
