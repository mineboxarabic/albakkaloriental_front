# AlimExpressCatalog Backlog

Backlog de developpement pour le portail catalogue AlimExpress / JardinVert.

Objectif produit : construire une application Next.js autonome qui sert a la fois le catalogue public B2C et le portail professionnel B2B, en utilisant la meme base PostgreSQL que `AlimExpressApp`.

Regle centrale : ce projet ne lance jamais `prisma migrate`. Les migrations appartiennent exclusivement a `AlimExpressApp`. Ici, seul `prisma generate` est autorise.

## Statut Global

| Phase | Statut | Objectif |
| --- | --- | --- |
| Phase 1 | En cours | Setup projet, dependances, Prisma shared DB |
| Phase 2 | A faire | Fondations session, panier, data layer catalogue |
| Phase 3 | A faire | Parcours retail B2C |
| Phase 4 | A faire | Portail wholesale B2B |
| Phase 5 | A faire | Tests E2E Playwright |
| Phase 6 | A faire | Smoke tests et validation finale |

## Phase 1 - Project Setup

### Task 1 - Bootstrap du projet

- [x] Creer l'application Next.js `AlimExpressCatalog`.
- [x] Installer TypeScript, Tailwind, App Router, alias `@/*`.
- [x] Installer `prisma`, `@prisma/client`, `jose`, `bcryptjs`, `date-fns`, `zod`.
- [x] Installer `@types/bcryptjs`.
- [x] Initialiser shadcn/ui.
- [x] Ajouter les composants shadcn/ui : `button`, `input`, `select`, `card`, `badge`, `separator`.
- [x] Aligner le projet sur Next.js 15.
- [x] Mettre a jour le README avec le CDC AlimExpress / JardinVert.
- [x] Initialiser Prisma avec `npx prisma init`.
- [x] Copier `DATABASE_URL` depuis `AlimExpressApp/.env` vers `.env`. _(Source : `AlimExpressApp/docker-compose.yml` -> `postgres:password@localhost:5433/stock_manager`.)_
- [x] Creer `.env.example` avec `DATABASE_URL` et `JWT_SECRET`.
- [x] Remplacer `prisma/schema.prisma` par le schema subset catalogue.
- [x] Verifier que les enums et modeles correspondent exactement a `AlimExpressApp`. _(Ajoute `BaseUnit`, `PackagingType`, et `Product.packaging` requis par la DB admin.)_
- [x] Executer `npx prisma generate`.
- [x] Creer `lib/prisma.ts` avec le singleton Prisma.
- [ ] Commit attendu : `feat: bootstrap AlimExpressCatalog with shared DB Prisma config`.

> Note Prisma 7 : `url` n'est plus autorise dans `schema.prisma`. La connexion est definie dans `prisma.config.ts` (`datasource.url = process.env.DATABASE_URL`, charge via `dotenv/config`).
> DB partagee verifiee : container Docker `stock_manager_db` (port 5433) accessible, 15 produits presents.

### Schema Prisma attendu

Modeles requis dans le subset catalogue :

- `Product`
- `RetailCustomer`
- `RetailOrder`
- `RetailOrderItem`
- `DeliverySchedule`
- `Customer`
- `User`
- `Order`
- `OrderItem`

Enums requis :

- `ProductVisibility`
- `PricingLevel`
- `RetailOrderStatus`
- `OrderStatus`
- `PaymentStatus`
- `SaleUnit`
- `Role`

## Phase 2 - Shared Foundations

### Task 2 - Session helper et Cart Context

- [x] Creer `lib/session.ts`.
- [x] Implementer les types `RetailSession`, `ProSession`, `CatalogSession`.
- [x] Implementer `signSession`.
- [x] Implementer `getSession`.
- [x] Implementer `setSessionCookie`.
- [x] Implementer `clearSessionCookie`.
- [x] Installer Vitest et dependances de test React si necessaire.
- [x] Creer `__tests__/session.test.ts`.
- [x] Executer `npx vitest run __tests__/session.test.ts`. _(4 tests passed)_
- [x] Creer `components/cart-context.tsx`.
- [x] Implementer `CartProvider` avec `storageKey`.
- [x] Implementer `addItem`, `updateQty`, `removeItem`, `clearCart`, `total`.
- [x] Creer `__tests__/cart-context.test.tsx`.
- [x] Executer `npx vitest run __tests__/cart-context.test.tsx`. _(6 tests passed)_
- [ ] Commit attendu : `feat: add session helper and cart context with unit tests`.

### Regles panier

- Panier retail : `localStorage` key `retail_cart`.
- Panier pro : `localStorage` key `pro_cart`.
- Les paniers doivent rester strictement separes.

### Task 3 - Catalog data layer et home page

- [x] Creer `lib/catalog.ts`. _(Pures fonctions extraites dans `lib/catalog-pricing.ts` pour pouvoir etre testees sans `server-only`/Prisma.)_
- [x] Implementer `getTierPrice`.
- [x] Implementer `getProducts`.
- [x] Implementer `getProduct`.
- [x] Implementer `getCategories`.
- [x] Implementer `getUpcomingDeliveries`.
- [x] Creer `__tests__/catalog.test.ts`.
- [x] Executer `npx vitest run __tests__/catalog.test.ts`. _(5 tests passed)_
- [x] Verifier `app/layout.tsx`.
- [x] Construire `app/page.tsx`. _(Server component, donnees DB via Prisma adapter pg, `revalidate = 60`.)_
- [x] Afficher les produits mis en avant. _(6 best-sellers + 6 nouveautes depuis la DB, fallback placeholder beige si pas d'imageUrl.)_
- [x] Afficher les prochaines tournees de livraison. _(Section ne s'affiche que si `DeliverySchedule` contient des entrees a venir actives.)_
- [x] Ajouter CTA vers `/products`. _(Bouton hero "Voir nos produits" + liens cartes produit.)_
- [x] Ajouter CTA vers `/pro/login`. _(Lien "Espace pro" dans la barre utilitaire en haut.)_
- [ ] Commit attendu : `feat: add catalog data layer, home page, and getTierPrice unit tests`.

> Note Prisma 7 : ajout de `@prisma/adapter-pg` + `pg`. `lib/prisma.ts` instancie `PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) })`.

## Phase 3 - Retail Flow B2C

### Task 4 - Retail products et cart

- [x] Creer `app/(retail)/layout.tsx`. _(Home `/` deplace dans `app/(retail)/page.tsx` ; le groupe gagne le `CartProvider`, `SiteHeader`, `SiteFooter`.)_
- [x] Wrapper le layout retail avec `CartProvider storageKey="retail_cart"`.
- [x] Creer navigation retail : accueil, catalogue, panier, compte. _(Top bar : Mon compte + Espace pro. Nav : TOUS LES RAYONS, categories, PROMOTIONS. Logo → `/`, icone panier → `/cart`, search → `/products?q=`.)_
- [x] Creer `app/(retail)/products/page.tsx`. _(Grille 3 colonnes + sidebar filtres categorie, query params `?category=`, `?q=`.)_
- [x] Afficher le catalogue retail avec prix standards. _(`getProducts({audience:'retail'})` filtre `RETAIL`/`BOTH`.)_
- [x] Ajouter filtre categories. _(Sidebar listant `getCategories('retail')` ; categorie active mise en valeur, lien "Toutes les categories".)_
- [x] Creer `app/(retail)/products/[id]/page.tsx`. _(Server component ; image, prix, breadcrumb, suggestions meme categorie.)_
- [x] Masquer les produits `WHOLESALE` purs sur le retail. _(`getProduct(id, 'retail')` renvoie `null` → `notFound()` si `visibility === WHOLESALE`.)_
- [x] Creer `app/(retail)/products/[id]/add-to-cart-button.tsx`. _(Client component : selecteur quantite +/- + bouton primaire avec feedback "Ajoute".)_
- [x] Creer `app/(retail)/cart/page.tsx`. _(Client component ; empty state, lignes editables, recapitulatif aside.)_
- [x] Ajouter controles quantite plus / moins. _(Boutons -/+, qty=0 supprime via `updateQty`.)_
- [x] Ajouter suppression article. _(Icone corbeille par ligne + bouton "Vider le panier".)_
- [x] Afficher total panier. _(Sous-total + total dans le bloc aside ; badge header reactif via `useCart`.)_
- [x] Ajouter boutons continuer achat et checkout. _("Continuer mes achats" → `/products`, "Valider mon panier" → `/checkout` (Task 5).)_
- [ ] Commit attendu : `feat: add retail product listing, detail, and cart pages`.

### Task 5 - Retail auth, checkout et suivi commande
-- quand je vais dans inscription j ai 2 choix, c'est je suis un particultier ou je suis une entreprise, 
si tu clique je suis une entreprise, y a une formulaire, nom prenom nom entreprise et adresse telephone, apres y a un button whatsapp pour envoyer le KBIS, avec une expliquation de quoi faire. clique sur le button whatsapp on a un message deja ecrit et a envoyer aux numero +33766301339 pour envoyer ton kbis, et pour le mot de passe, on le cree avec le panel admin! mais c'est a gere sur le 2eme projet apres

- [x] Creer `actions/retail-auth.ts`. _(Zod + bcryptjs + jose session cookie.)_
- [x] Implementer inscription retail avec telephone + mot de passe. _(Form particulier : prenom, nom, telephone, ville, adresse, password.)_
- [x] Hash password avec `bcryptjs`. _(salt rounds = 10.)_
- [x] Creer session JWT cookie apres inscription.
- [x] Implementer login retail. _(Recherche par phone, bcrypt.compare, rejette comptes inactifs.)_
- [x] Implementer logout retail. _(`logoutRetail()` clearCookie + redirect.)_
- [x] Creer `actions/retail-order.ts`.
- [x] Implementer creation `RetailOrder`. _(Recheck visibility ; refuse `WHOLESALE`-only.)_
- [x] Generer `orderNumber` format `RET-00001`. _(Padding 5 chiffres via `count + 1`.)_
- [x] Creer les `RetailOrderItem`. _(Cree en cascade via `items: { create: [...] }`.)_
- [x] Creer `app/(retail)/register/page.tsx`. _(Page de choix : particulier / entreprise.)_
  - [x] `app/(retail)/register/particulier/page.tsx` — formulaire complet (server action `registerRetail`).
  - [x] `app/(retail)/register/entreprise/page.tsx` — formulaire + bouton WhatsApp pre-rempli vers +33766301339, KBIS a joindre. Pas de mot de passe (admin app gere la creation utilisateur).
- [x] Creer `app/(retail)/login/page.tsx`. _(Form telephone + mot de passe, server action `loginRetail`.)_
- [x] Creer `app/(retail)/checkout/page.tsx`. _(Server guard : redirige `/login?next=/checkout` si pas de session retail. Charge le `RetailCustomer` pour pre-remplir.)_
- [x] Checkout client lit le panier `retail_cart`. _(`CheckoutForm` (client) lit via `useCart`.)_
- [x] Checkout redirige vers `/orders/[id]`. _(Apres `createRetailOrder` ok, `clearCart()` + `router.push`.)_
- [x] Creer `app/(retail)/orders/[id]/page.tsx`. _(Server, verifie ownership `order.customerId === session.customerId`.)_
- [x] Afficher statut en francais : En attente, Confirmee, En preparation, Livree, Annulee. _(Mapping `STATUS_LABELS` avec couleurs.)_
- [x] Ajouter message : `Nous vous contacterons pour confirmer votre commande.`
- [ ] Commit attendu : `feat: add retail auth, checkout, and order confirmation`.

et quand t es particulier tu cree ton compte normal, nom prenom adresse telephone mot de passe!    
- [ ] Creer `actions/retail-auth.ts`.
- [ ] Implementer inscription retail avec telephone + mot de passe.
- [ ] Hash password avec `bcryptjs`.
- [ ] Creer session JWT cookie apres inscription.
- [ ] Implementer login retail.
- [ ] Implementer logout retail.
- [ ] Creer `actions/retail-order.ts`.
- [ ] Implementer creation `RetailOrder`.
- [ ] Generer `orderNumber` format `RET-00001`.
- [ ] Creer les `RetailOrderItem`.
- [ ] Creer `app/(retail)/register/page.tsx`.
- [ ] Creer `app/(retail)/login/page.tsx`.
- [ ] Creer `app/(retail)/checkout/page.tsx`.
- [ ] Checkout client lit le panier `retail_cart`.
- [ ] Checkout redirige vers `/orders/[id]`.
- [ ] Creer `app/(retail)/orders/[id]/page.tsx`.
- [ ] Afficher statut en francais : En attente, Confirmee, En preparation, Livree, Annulee.
- [ ] Ajouter message : `Nous vous contacterons pour confirmer votre commande.`
- [ ] Commit attendu : `feat: add retail auth, checkout, and order confirmation`.

## Phase 4 - Wholesale Portal B2B

### Task 6 - Middleware pro et auth

- [ ] Creer `middleware.ts`.
- [ ] Proteger toutes les routes `/pro/*`.
- [ ] Laisser `/pro/login` public.
- [ ] Rediriger les non-authentifies vers `/pro/login`.
- [ ] Verifier que la session est de type `pro`.
- [ ] Creer `actions/pro-auth.ts`.
- [ ] Login pro via compte `User` role `B2B_CLIENT`.
- [ ] Refuser les comptes inactifs.
- [ ] Refuser les utilisateurs sans `customer`.
- [ ] Creer session pro avec `userId`, `customerId`, `pricingLevel`, `companyName`.
- [ ] Creer `app/(pro)/layout.tsx`.
- [ ] Wrapper le layout pro avec `CartProvider storageKey="pro_cart"`.
- [ ] Afficher navigation pro : produits, commandes, factures, logout.
- [ ] Creer `app/(pro)/pro/login/page.tsx`.
- [ ] Commit attendu : `feat: add pro portal middleware, login, and layout`.

### Task 7 - Pro catalog, cart et proforma

- [ ] Creer `app/(pro)/pro/products/page.tsx`.
- [ ] Afficher catalogue wholesale.
- [ ] Calculer les prix avec `getTierPrice`.
- [ ] Afficher le niveau tarifaire C/D/E/F.
- [ ] Creer `app/(pro)/pro/products/[id]/page.tsx`.
- [ ] Creer `app/(pro)/pro/products/[id]/add-to-pro-cart-button.tsx`.
- [ ] Ajouter au panier avec le prix de niveau deja calcule.
- [ ] Creer `app/(pro)/pro/cart/page.tsx`.
- [ ] Ajouter bouton `Generer un devis`.
- [ ] Creer `actions/pro-order.ts`.
- [ ] Implementer `createProforma`.
- [ ] Generer `orderNumber` format `PRO-00001`.
- [ ] Creer `Order` avec `status: PENDING`.
- [ ] Regle : `PENDING` = devis / proforma.
- [ ] Implementer `confirmProforma`.
- [ ] Regle : `CONFIRMED` = commande ferme.
- [ ] Creer `app/(pro)/pro/proforma/[id]/page.tsx`.
- [ ] Afficher recapitulatif devis avec lignes, quantites, prix unitaires, total.
- [ ] Ajouter bouton `Valider la commande`.
- [ ] Ajouter lien `Modifier` vers `/pro/cart`.
- [ ] Commit attendu : `feat: add pro catalog with tier prices, cart, and proforma flow`.

### Task 8 - Pro orders et invoices

- [ ] Creer `app/(pro)/pro/orders/page.tsx`.
- [ ] Afficher historique des commandes du `customerId` connecte.
- [ ] Afficher numero, date, total, badge statut.
- [ ] Labels statuts : `PENDING` = Devis, `CONFIRMED` = Commande confirmee, `DELIVERED` = Livree.
- [ ] Creer `app/(pro)/pro/invoices/page.tsx`.
- [ ] Ajouter placeholder : `Vos factures seront disponibles ici apres livraison.`
- [ ] Ajouter TODO pour brancher le modele `Invoice` quand l'admin genere les factures.
- [ ] Commit attendu : `feat: add pro order history and invoices placeholder`.

## Phase 5 - E2E Tests

### Task 9 - Playwright setup et retail E2E

- [ ] Installer `@playwright/test`.
- [ ] Installer Chromium avec `npx playwright install chromium`.
- [ ] Creer `playwright.config.ts`.
- [ ] Configurer `baseURL: http://localhost:3000`.
- [ ] Configurer `webServer` avec `npm run dev`.
- [ ] Creer `e2e/retail.spec.ts`.
- [ ] Tester home page avec les deux CTA.
- [ ] Tester chargement `/products`.
- [ ] Tester detail produit avec bouton ajouter au panier.
- [ ] Tester panier vide initial.
- [ ] Tester acces page register.
- [ ] Tester validation mot de passe court.
- [ ] Tester inscription valide et redirection `/`.
- [ ] Executer `npx playwright test e2e/retail.spec.ts --reporter=list`.
- [ ] Commit attendu : `test: add Playwright E2E for retail catalog and registration`.

### Task 10 - Pro portal E2E

- [ ] Creer `e2e/pro.spec.ts`.
- [ ] Tester acces `/pro/login`.
- [ ] Tester redirection `/pro/products` vers `/pro/login` sans session.
- [ ] Tester redirection `/pro/cart` vers `/pro/login` sans session.
- [ ] Tester mauvais identifiants et affichage erreur.
- [ ] Executer `npx playwright test e2e/pro.spec.ts --reporter=list`.
- [ ] Commit attendu : `test: add Playwright E2E for pro portal auth and middleware`.

## Phase 6 - Final Wiring et Smoke Tests

### Task 11 - Checklist finale

- [ ] Executer `npx vitest run`.
- [ ] Executer `npx playwright test --reporter=list`.
- [ ] Verifier `/` : home, dates de livraison, produits mis en avant, CTA.
- [ ] Verifier `/products` : grille produit, detail, ajout panier.
- [ ] Verifier `/cart` : article visible, plus / moins, suppression.
- [ ] Verifier `/register` : inscription retail et redirection.
- [ ] Verifier `/checkout` : creation commande retail.
- [ ] Verifier `/orders/[id]` : confirmation et items corrects.
- [ ] Verifier `/pro/products` non authentifie : redirection `/pro/login`.
- [ ] Verifier `/pro/login` avec un compte `B2B_CLIENT` valide.
- [ ] Verifier prix pro selon niveau C/D/E/F.
- [ ] Verifier panier pro.
- [ ] Verifier generation devis `/pro/proforma/[id]`.
- [ ] Verifier validation devis vers commande confirmee.
- [ ] Verifier `/pro/orders`.
- [ ] Verifier `/pro/invoices` placeholder.
- [ ] Commit final attendu : `feat: complete AlimExpressCatalog retail + wholesale portal`.

## Definition of Done

Une tache est terminee quand :

- le code est implemente selon le CDC ;
- les regles Prisma sont respectees ;
- les routes concernees fonctionnent ;
- les erreurs utilisateur sont affichees clairement ;
- les tests unitaires ou E2E pertinents passent ;
- `npm run lint` passe ;
- le commit correspondant est cree.

## Notes de dependance

- `AlimExpressApp` doit avoir les migrations et modeles DB necessaires.
- `AlimExpressCatalog` partage la base de donnees mais ne possede pas les migrations.
- Si un champ Prisma ne correspond pas au schema reel, corriger le subset local pour matcher `AlimExpressApp` avant `prisma generate`.
