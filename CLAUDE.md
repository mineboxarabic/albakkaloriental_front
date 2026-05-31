<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AlimExpressCatalog Agent Guide

This repository is the standalone catalog portal for AlimExpress / JardinVert. It serves both the public retail catalog and the protected wholesale professional portal.

## Project References

Use these Desktop paths as the source references for this project:

- CDC / specification document: `C:\Users\Yassin\Desktop\Cahier_des_charges_AlimExpress_JardinVert.docx`
- Backend / admin app reference: `C:\Projects\Personal\AlimExpressApp`

Before implementing database, Prisma, auth, order, invoice, or business-rule work, inspect the backend reference app and keep AlimExpressCatalog compatible with it.


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
- Order rule thresholds (minimum order, delivery fee, free-delivery threshold, max qty per product) are defined in `lib/order-rules.ts`. Change values there only — never use magic numbers in components.

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

## Design Palette

Use this palette as the visual baseline for AlimExpressCatalog:

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

Apply the colors consistently:

- Use `#3F561F` for primary actions, active navigation, important links, and brand accents.
- Use `#FAF8F2` for the main app background.
- Use `#F0EBDD` for calm section backgrounds and grouped content zones.
- Use `#171717` for primary text and `#6B665D` for secondary text.
- Use `#DDD8CC` for borders, dividers, and subtle outlines.
- Reserve `#D52B14` and `#F2C400` for promotions, warnings, highlights, and price attention states.

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
