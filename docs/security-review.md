# Security Review — albakkaloriental_front (front) — Fin de projet

> **Vérification de sécurité de fin de projet.** Audit lecture seule du 2026-06-14, puis remédiation.
> Périmètre : ce repo front (client REST pur). Les findings du back sont dans `AlimExpressApp/docs/security-review.md`.
> Colonne **Statut** : ✅ corrigé · 🔧 mitigé (suite ops requise) · ⏳ à faire · 👤 action humaine/ops requise.

## Synthèse (remédiation au 2026-06-14)

Légende : ✅ corrigé & vérifié · 🔧 mitigé, suite ops requise · 👤 action humaine/ops.

| # | Sévérité | Finding | Statut |
|---|----------|---------|--------|
| F-H2 | 🟠 High | JWT sans algorithme épinglé (`lib/session.ts`, `middleware.ts`) | ✅ (`algorithms:['HS256']`) |
| F-H3 | 🟠 High | `AUTH_SECRET` partagé cross-repo (le front vérifie avec le secret du back) | 🔧 — 👤 migration asymétrique (transverse) |
| F-H6 | 🟠 High | Headers de sécurité absents (`next.config.ts`) — portail clickjackable | ✅ |
| F-H7 | 🟠 High | Dépendances : avis hono/postcss (`npm audit`) | ✅ `npm audit fix` (hono résolu, build + 151 tests verts) ; postcss build-only restant (fix = next@9, non pertinent) |
| F-M4 | 🟡 Medium | `AUTH_SECRET` : longueur min trop basse (middleware `< 8`) | ✅ (≥32, cohérent back) |
| F-L2 | 🟢 Low | Cookie `catalog_session` `sameSite:'lax'` | ✅ (`strict`) |

### Actions humaines/ops restantes (front)
1. **F-H3** : côté transverse — le back signe avec une clé privée, le front ne garde que la clé publique (vérification seule). Voir `AlimExpressApp/docs/security-review.md` H3.
2. **Tests** : 151/151 verts après remédiation (JWT pin, min-length, cookie strict, headers, npm audit fix).

---

## Détail & remédiation

### F-H2 — JWT algorithme non épinglé
`lib/session.ts:74` et `middleware.ts:16` : `jwtVerify(token, key)` sans option `algorithms`. Accepte n'importe quelle variante HMAC.
**Fix** : `jwtVerify(token, key, { algorithms: ['HS256'] })` aux 2 sites.

### F-H3 — `AUTH_SECRET` partagé cross-repo
Le front vérifie les JWT avec le **même secret symétrique** que celui qui les signe côté back (HMAC sign == verify). Si l'env du front fuite, on peut forger des tokens back (y compris `role:ADMIN`).
**🔧 Mitigation côté front** : pin algo (F-H2) + longueur min (F-M4). **Suite recommandée (ops, transverse)** : passer à une signature asymétrique — le back signe avec une clé privée, le front ne détient que la clé **publique** (vérification seule, incapable de forger). Voir `AlimExpressApp/docs/security-review.md` H3.

### F-H6 — Headers de sécurité absents
`next.config.ts` sans bloc `headers()`. Le portail `/pro/*` (cookie `catalog_session`) est clickjackable, pas de HSTS/CSP/nosniff.
**Fix** : `async headers()` avec `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.

### F-H7 — Dépendances
`npm audit` : hono (transitive — JWT middleware accepte tout schéma Authorization, GHSA-f577-qrjj-4474), postcss XSS (build-time).
**Fix** : `npm audit fix` (non-breaking). Vérifier si hono est runtime (probablement transitive tooling).

### F-M4 — `AUTH_SECRET` longueur min
`middleware.ts:8` tolère `length < 8` (trop bas) ; `lib/session.ts:33` ne vérifie que la présence.
**Fix** : exiger ≥ 32 octets dans les 2 fichiers (cohérent avec le back).

### F-L2 — Cookie `sameSite`
`lib/session.ts:94,106` : `catalog_session` en `sameSite:'lax'`.
**Fix** : `'strict'` (les appels mutants passent par l'API client bearer-from-cookie, donc pas de besoin cross-site).
