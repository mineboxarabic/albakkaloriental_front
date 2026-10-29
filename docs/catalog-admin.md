# Manage catalogue products from thumbnails

Only an administrator logged into the current portal can enable **Mode admin**. A retail visit checks the retail cookie only; a wholesale visit checks the wholesale cookie only. Product thumbnails reveal edit, replace, image search and enhancement controls on hover or keyboard focus. Phones use the visible ellipsis button. The same controls are available on product detail images. The edit link opens the exact product in the back office.

The management dialog separates catalogue membership (retail/wholesale/both) from each channel's visibility. Only changed fields are submitted, with an optimistic version check. **Tous les produits (admin)** includes hidden products and supports search, allowing products to be restored without opening the back office. Non-admins requesting `adminView=all` receive the ordinary public catalogue.

File uploads and URL replacements, AI search results and enhanced images all go through a current/new image comparison. A missing current image gets an empty placeholder. No image changes until Apply; closing the dialog leaves the product unchanged. Search candidates include clickable source attribution. Check product identity and packaging text before applying AI results.

## Security and compatibility

Admin capability is checked server-side against the backend on each action, with per-request deduplication only during rendering. The backend independently rechecks the current account and strict field whitelist. Tokens, OpenAI credentials and storage credentials are never passed to client components. Server-only modules enforce that boundary. Server Actions retain same-origin protection; no wildcard allowed origins are configured.

Both portal cookies can coexist while logged in, but signing out from either portal clears both. A customer or guest never inherits a different portal's administrator session. The toolbar revalidates access on mount, window focus, visibility changes and every 30 seconds, and hides on denial or verification failure. Explicit bearer requests never clear another portal's cookie. A revoked admin session cannot save an already-open dialog. Stale product/image changes return a conflict rather than silently overwriting someone else's work.

`BACKEND_ADMIN_URL` optionally configures the edit-link origin; it defaults to `BACKEND_URL`. Uploads accept JPEG/PNG/WebP up to 5 MiB. The Server Action body limit is 8 MiB to accommodate base64 encoding; backend validation independently caps the image payload. The companion backend API and existing S3/OpenAI configuration are required. AI calls are billed to the configured provider account.

## Validation

- Full frontend unit suite: **252 tests passed**.
- `npm run test:catalog-admin:e2e`: **14 Chromium tests passed**, covering anonymous browsing, both cross-portal isolation cases, logout of both sessions, permission refresh on focus, desktop hover, phone controls, hidden-product restoration, channel placement, file/URL/AI preview flows, role revocation, anonymous/customer/mixed-account replay of an actual Server Action request, CSRF and failure behavior. Uses isolated backend fixtures; real backend authorization and writes are tested separately against disposable PostgreSQL in the backend repository.
- `npx tsc --noEmit` and `npm run build` passed.
- Changed frontend files pass ESLint. Full `npm run lint` remains blocked by 12 pre-existing errors in unrelated auth/cart files and the older mock backend.
- No live paid AI generation/search or production S3 operation was performed. Review provider access/model configuration before enabling those actions in production.

No deployment or database migration is included.
