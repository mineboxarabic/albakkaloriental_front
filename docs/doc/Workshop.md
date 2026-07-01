# Dossier technique — Alim Express

**Plateforme de gestion et portail client pour un grossiste alimentaire halal-oriental (région PACA)**

> *Document destiné au jury MBA, complémentaire de la soutenance et de la note de cadrage.*
> Conformément au guide du workshop client, ce dossier n'est **pas un exercice de rédaction** :
> il **compile et donne à voir les livrables réellement produits** (code source, outils de
> pilotage, documentation, recette) et en fournit les **liens d'accès**. Il est organisé selon les
> cinq critères de la **grille « Réalisation du projet — MBA Développeur full stack »**.

---

## Identité du projet

| | |
| --- | --- |
| **Projet** | Alim Express — plateforme de gestion (back-office) + portail client (B2C/B2B) |
| **Commanditaire** | Rashed Younes, dirigeant d'Alim Express (grossiste halal-oriental, PACA) |
| **Enseigne commerciale (storefront)** | Le Bakkal Oriental |
| **Formation** | MBA Développeur Full Stack 2 — Manager de projet web et digital, MyDigitalSchool |
| **Encadrante pédagogique** | Camille SIX |
| **Période de réalisation** | 3 mars → 22 juin 2026 (gel de version le 19 juin) |
| **Rendu du dossier / Soutenance** | 22 juin 2026 / 1er juillet 2026 |

**Équipe et apports individuels**

| Membre | Rôle | Périmètre de réalisation |
| --- | --- | --- |
| **Yassin** | Développeur back-end (partenaire technique engagé par le commanditaire) | Cœur du **back-office** : produits, stock par lots & palettes (FEFO), commandes pro, devis, avoirs, tableau de bord ; explorations IA. |
| **Anas** | Développeur front-end | **Portail client** dans son intégralité : parcours particuliers et professionnels, UX responsive **mobile-first**, génération des PDF devis/facture côté client. |
| **David** | Coordination projet + développeur | **API** reliant back-office et portail ; modules **clients particuliers, facturation, livraisons** côté back-office ; pilotage, relation commanditaire/encadrante, note de cadrage, recettage. |

---

## Index des livrables (liens pour le jury)

> *À compléter avec les URL réelles avant le rendu.*

| Livrable | Type | Accès |
| --- | --- | --- |
| **Note de cadrage** (document fondateur, v1.0 approuvée 03/03/2026) | PDF | [docs/doc/Note-de-cadrage-Alim-Express-David.pdf](Note-de-cadrage-Alim-Express-David.pdf) |
| **Code source — back-office** (API + administration) | Dépôt GitHub | `https://github.com/mineboxarabic/AlimExpressApp` |
| **Code source — portail client** (B2C + B2B) | Dépôt GitHub | `https://github.com/mineboxarabic/albakkaloriental_front` |
| **Tableau de pilotage** (backlog, sprints, blocages) | Trello | *lien partagé en consultation* |
| **Environnement de démonstration** | Application déployée | *URL de démo* |
| **Documentation de tests** | Markdown | [docs/doc/TESTING.md](TESTING.md) |
| **Spécifications & conventions** | Markdown (dépôts) | `AGENTS.md`, `README.md` |
| **Procès-verbal de recettage** | PDF signé | *à joindre* |
| **Guides utilisateur** (back-office, portail) | PDF | *à joindre* |

---

# Critère 1 — Structuration technique de l'application *(/5)*

## 1.1 Architecture cible : deux applications, une base partagée

L'architecture repose sur **deux applications web distinctes partageant une même base de données
PostgreSQL**, conformément à la note de cadrage :

```
┌────────────────────────────┐        ┌────────────────────────────┐
│   PORTAIL CLIENT (front)    │  API   │   BACK-OFFICE (admin)      │
│   AlimExpressCatalog        │ ─────► │   AlimExpressApp           │
│   B2C + B2B (Anas)          │  REST  │   + API /api/v1/* (David)  │
│                             │ /v1/*  │   gestion interne (Yassin) │
└────────────────────────────┘        └─────────────┬──────────────┘
        consomme l'API, pas                          │ Prisma
        d'accès direct à la BDD                       ▼
                                          ┌────────────────────────┐
                                          │   PostgreSQL (partagée) │
                                          └────────────────────────┘
```

**Justification :** séparer la surface publique (portail) de la surface interne (back-office)
simplifie le raisonnement sur la sécurité et permet de faire évoluer/redimensionner chaque
application indépendamment. Le portail **consomme l'API** du back-office et n'accède pas
directement à la base.

## 1.2 Stack technique

| Couche | Back-office (AlimExpressApp) | Portail client (AlimExpressCatalog) |
| --- | --- | --- |
| Framework | Next.js 15 (App Router), React 19 | Next.js 15 (App Router), React 19 |
| Langage | TypeScript strict | TypeScript strict |
| UI | Tailwind CSS + shadcn/ui | Tailwind CSS v4 + shadcn/ui + Lucide |
| Base de données | PostgreSQL + Prisma (schéma ~980 lignes) | consommation API REST `/api/v1/*` |
| Authentification | Session serveur (admin) + JWT (clients) | JWT portable (`jose`), cookie HttpOnly |
| Validation | Zod (entrées/sorties) | Zod (formulaires & réponses API) |
| Documents | génération PDF (devis, factures, bons) | rendu PDF devis/facture côté client |
| Tests | Vitest + Playwright | Vitest + Testing Library + Playwright |

**Choix justifiés** (note de cadrage §4) : Next.js (écosystème React maîtrisé, rendu client +
logique serveur dans un même projet), PostgreSQL (données fortement relationnelles, transactions
fiables pour les mouvements de stock).

## 1.3 Organisation du code — portail client

```
app/
├── (public)/   → CGV, confidentialité, contact, mots de passe, vérification e-mail
├── (retail)/   → B2C : accueil, produits, panier, checkout, compte, suivi commande
└── (pro)/      → B2B : login pro, catalogue à niveaux tarifaires, devis, commandes, factures
actions/        → Server Actions (mutations) validées par Zod (pro-quote.ts, pro-order.ts, …)
lib/            → api-client.ts, session.ts, catalog-pricing.ts (niveaux C/D/E/F), order-rules.ts
components/     → ui/ (shadcn), retail/, pro/
middleware.ts   → protection des routes /pro/* (vérification JWT)
```

Les **groupes de routes** isolent proprement les parcours B2C / B2B / public. Les **règles métier
sont centralisées** (`order-rules.ts`, `catalog-pricing.ts`) pour éviter la duplication (DRY).

## 1.4 Authentification — trois publics, trois mécanismes

- **Administrateurs internes** : session côté serveur (révocation immédiate des accès).
- **Particuliers & professionnels** : **JWT portable** émis par le back-office, vérifiable par le
  portail (cas d'usage adapté à l'architecture en deux applications), stocké en cookie HttpOnly.
- Cloisonnement strict : le portail ne peut jamais atteindre une opération réservée à l'admin.

## 1.5 Points techniques notables (les plus complexes)

1. **Tarification par niveaux** (B2B) calculée dynamiquement, jamais exposée à un visiteur non
   authentifié.
2. **Cycle commercial** complet (devis → acceptation horodatée → commande ferme → facture →
   avoir avec remise en stock).
3. **Stock par lots/palettes** avec sortie **FEFO** (lot le plus proche de la péremption d'abord)
   et déduction automatique à la livraison.
4. **Logistique** : géolocalisation des adresses, regroupement par zone, ordre de tournée,
   **verrouillage automatique des commandes à 21h la veille** de la livraison.

## 1.6 Qualité logicielle

- **Couverture de tests > 60 %** sur les modules critiques (commandes, stock, facturation, auth).
- **Validation systématique** des données aux frontières réseau (Zod).
- **Revue de code en binôme** (Pull Requests), commits conventionnels, **journal d'audit** des
  opérations sensibles côté back-office.

---

# Critère 2 — Contraintes d'hébergement anticipées *(/3)*

L'environnement technique du commanditaire était minimal (aucun SI, tableurs + papier), donc
**aucune contrainte d'intégration** avec un existant. Les choix d'hébergement ont été faits pour
la **sobriété tarifaire et la fiabilité** (note de cadrage §7).

| Poste | Service retenu | Tarification | Coût estimé/an |
| --- | --- | --- | --- |
| Hébergement web + base de données | **Railway** (plan Hobby) | 5 $/mois, crédits inclus | ~60 € |
| Stockage des documents PDF | **AWS S3** | à l'usage, faible volumétrie | ~60 € |
| E-mails transactionnels | **Resend** (plan gratuit) | 3 000 e-mails/mois inclus | 0 € |
| Notifications mobiles | **Twilio** (WhatsApp) | 0,005 $/message | ~40 € |
| Géocodage des adresses | Référentiel public français (BAN) | gratuit | 0 € |
| **Total infrastructure v1** | | | **~160 €** |

**Anticipations intégrées dès le développement :**

- **Variables d'environnement** centralisées (`.env.example`) : `BACKEND_URL`,
  `NEXT_PUBLIC_BACKEND_URL`, `AUTH_SECRET` (secret JWT partagé back/front).
- **Images produit** servies depuis S3, **domaine distant autorisé** dans `next.config.ts`.
- **Mode dégradé** prévu pour chaque dépendance tierce critique (risque R6 de la note de cadrage).
- **Montée en charge** anticipée : indexation soignée de la base, monitoring de l'hébergement,
  tests de charge avant mise en production (risque R8).
- **Cibles techniques** : page catalogue < 1 s (95e centile), taux d'erreur serveur < 1 %,
  disponibilité > 99 %.

---

# Critère 3 — Administration facilitée par un back-office *(/5)*

L'administration est assurée par l'application **AlimExpressApp** (back-office web), qui
**centralise toute la gestion** d'Alim Express dans un outil unique.

## 3.1 Modules du back-office

| Module | Fonctions principales |
| --- | --- |
| **Produits** | Catalogue, SKU/codes-barres, images (S3), **niveaux tarifaires** (C/D/E/F), visibilité RETAIL/WHOLESALE/BOTH, masquage des indisponibles. |
| **Stock** | Suivi par **lots** (dates de péremption, **FEFO**) et **palettes**, déduction automatique à la livraison, traçabilité anti-survente. |
| **Clients** | Comptes particuliers (auto-inscription) et professionnels (création manuelle + activation par lien, qualification commerciale). |
| **Cycle commercial** | Devis (validité, acceptation horodatée), commande ferme, **facture**, **avoir** (remise en stock auto), documents **PDF**. |
| **Livraisons** | Géolocalisation, zonage, ordre de tournée, **verrouillage J-1 à 21h**, bons de chargement/livraison PDF. |
| **Transverse** | Tableau de bord d'activité, **journal d'audit**, notifications e-mail/WhatsApp, interface **multilingue FR/AR**. |
| **Accès** | Rôles ADMIN / MANAGER / STAFF (+ clients B2B/B2C), session serveur. |

## 3.2 Spécifications techniques et fonctionnelles écrites

Conformément au critère (« a minima les spécifications techniques et fonctionnelles ont été
écrites »), les livrables documentaires existent :

- **Modèle de données** : schéma Prisma (~980 lignes) couvrant l'ensemble des entités métier,
  déployable sur environnement vierge, jeu de données initial rejouable.
- **Contrat d'API** : points d'entrée `/api/v1/*` documentés, validations en entrée et sortie.
- **Spécifications fonctionnelles** des modules (comportements et règles métier), `AGENTS.md`.
- **Documentation utilisateur** : guide d'utilisation du back-office (session de formation de 2 h
  prévue pour l'équipe interne — plan de conduite du changement, note de cadrage §11).

---

# Critère 4 — Recettage formalisé et corrections *(/4)*

## 4.1 Stratégie de tests

Recettage à **deux niveaux automatisés** + recette manuelle avec le commanditaire, avec
**procès-verbal signé** (engagement de la note de cadrage §4 et §9).

- **Tests unitaires / composants** — Vitest + Testing Library (jsdom) : logique métier (`lib/`),
  Server Actions (back-office mocké), composants UI. Dossier `__tests__/`.
- **Tests end-to-end** — Playwright (Chromium) : parcours complets contre un back-end mocké en
  mémoire (`e2e/mock-backend.ts`). Dossier `e2e/`.
- **Objectif de couverture : > 60 %** sur les modules critiques (commandes, stock, facturation,
  authentification).

## 4.2 Exemple de plan de test (E2E — parcours panier, `e2e/cart.spec.ts`)

| # | Étape | Résultat attendu |
| --- | --- | --- |
| 1 | Ouvrir le catalogue retail | Produits affichés |
| 2 | Ajouter un produit au panier | Panier mis à jour |
| 3 | Dépasser la quantité maximale | Limite par produit respectée |
| 4 | Aller au paiement sous le minimum | Minimum de commande exigé |
| 5 | Atteindre le seuil de franco | Frais de livraison offerts |
| 6 | Valider la commande | Confirmation affichée |

## 4.3 Commandes de recette

```bash
npx vitest run --pool=threads      # tests unitaires et composants
npx playwright test                 # tests end-to-end
npm run lint                        # qualité du code (ESLint)
```

## 4.4 Corrections réalisées

Anomalies remontées en recette et corrigées (traçables dans l'historique Git) : refonte de la
navigation retail suite aux retours du commanditaire, ajustements responsive, intégration du
**branding Le Bakkal Oriental** (logo, favicon, icône d'application). Le procès-verbal de recette
formalise le périmètre testé, les anomalies, les corrections et le statut final de chaque parcours.

---

# Critère 5 — Responsive et mobile-first *(/3)*

Le portail client est conçu en **approche mobile-first** : l'expérience est pensée et validée
**prioritairement sur smartphone**, puis déclinée sur tablette et ordinateur — ce qui reflète
l'usage réel (restaurateurs et particuliers commandent depuis leur téléphone).

- Grilles fluides Tailwind, composants adaptatifs (menu, panier coulissant, cartes produit).
- **Charte graphique** Le Bakkal Oriental :

| Usage | Couleur | Hex |
| --- | --- | --- |
| Vert principal (CTA, nav) | Olive foncé | `#3F561F` |
| Fond principal | Blanc cassé chaud | `#FAF8F2` |
| Fond de section | Beige crème | `#F0EBDD` |
| Texte principal | Noir | `#171717` |
| Texte secondaire | Gris chaud | `#6B665D` |
| Bordures | Beige-gris clair | `#DDD8CC` |
| Alerte / promo | Rouge-orangé | `#D52B14` |
| Mise en avant | Jaune chaud | `#F2C400` |

- Typographie : *Poppins* (Google Fonts) et *Satoshi* (FontShare).

---

## Annexe — Glossaire technique

| Terme | Définition |
| --- | --- |
| **B2C / B2B** | Vente aux particuliers (prix standards) / aux professionnels (prix négociés par niveau). |
| **Devis (proforma)** | Document chiffré pré-commande, soumis au client pour acceptation. |
| **Commande ferme** | Devis accepté et signé, déclenchant la préparation. |
| **Avoir** | Document de crédit avec réintégration du stock concerné. |
| **FEFO** | *First-Expired-First-Out* : sortie du lot dont la péremption est la plus proche. |
| **Niveau tarifaire** | Catégorie de prix (C/D/E/F) attribuée à un client professionnel. |
| **Lot / Palette** | Produits regroupés par numéro et péremption / unité logistique de manutention. |
| **JWT** | Jeton d'authentification portable vérifiable entre le back-office et le portail. |

> Pour le détail métier, le contexte marché, les enjeux stratégiques, le budget, le planning et
> les risques, se reporter à la **note de cadrage** (livrable joint).
