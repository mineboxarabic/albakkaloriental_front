# AlimExpressCatalog

Application catalogue client pour le projet **AlimExpress / JardinVert**, solution digitale de gestion commerciale.

Ce projet est le frontend catalogue autonome destiné aux clients particuliers et professionnels. Il complète le back-office principal `AlimExpressApp`, qui reste responsable de l'administration, des migrations Prisma et de la gestion centrale des données.

## Objectif

AlimExpress / JardinVert veut centraliser la gestion commerciale afin de réduire le travail manuel, limiter les erreurs de prix, faciliter le suivi des commandes et offrir aux clients un catalogue en ligne clair.

La solution couvre trois grands besoins :

- centraliser les produits, clients, prix, commandes, factures et avoirs ;
- permettre aux particuliers de consulter le catalogue et passer commande avec les prix standards ;
- permettre aux professionnels de consulter le catalogue avec leurs prix personnalisés selon leur niveau tarifaire.

## Utilisateurs concernés

### Administrateur

L'administrateur utilise le back-office `AlimExpressApp` pour gérer :

- les produits, images, catégories, descriptions et disponibilités ;
- les clients particuliers et professionnels ;
- les niveaux tarifaires professionnels ;
- les commandes, statuts, factures et avoirs ;
- les modes de paiement et adresses de livraison.

### Client particulier

Le client particulier utilise le catalogue public pour :

- créer un compte simple avec téléphone, ville et adresse ;
- consulter les produits disponibles ;
- voir les prix standards ;
- ajouter des produits au panier ;
- passer commande ;
- suivre le statut de sa commande.

### Client professionnel

Le client professionnel, par exemple restaurant ou magasin, utilise l'espace B2B pour :

- se connecter avec un compte créé par l'administrateur ;
- consulter les prix personnalisés selon son niveau C, D, E ou F ;
- préparer une commande en grande quantité ;
- générer un devis / proforma ;
- valider le proforma pour transformer la demande en commande ferme ;
- consulter son historique, ses factures et les télécharger.

## Parcours particuliers B2C

1. Le client crée un compte avec numéro de téléphone, ville et adresse de livraison.
2. Il voit la date de passage prévue du vendeur dans sa ville.
3. Il consulte le catalogue public.
4. Il ajoute les produits au panier avec les quantités souhaitées.
5. Il valide sa commande.
6. L'entreprise rappelle le client pour confirmer la commande et organiser la livraison.
7. Le client suit le statut : en attente, confirmée, préparée, livrée ou annulée.

Points clés :

- l'inscription ne nécessite pas d'email ;
- la validation n'est pas un paiement immédiat ;
- le suivi de commande doit rester visible côté client.

## Parcours professionnels B2B

1. Le professionnel se connecte avec un compte créé en interne.
2. Le système identifie son niveau tarifaire C, D, E ou F.
3. Le catalogue affiche automatiquement les prix correspondants.
4. Le professionnel ajoute les produits au panier.
5. La validation génère un devis / facture proforma.
6. Le professionnel valide le proforma pour confirmer la commande.
7. Après livraison, la facture définitive est générée et disponible au téléchargement.

Points clés :

- pas d'auto-inscription pour les comptes B2B ;
- les prix affichés dépendent du niveau tarifaire attribué ;
- l'étape devis / proforma est obligatoire avant la commande ferme ;
- la facture définitive est distincte du proforma.

## Routes prévues

### Catalogue public

| Route | Description |
| --- | --- |
| `/` | Accueil public avec produits mis en avant et planning de livraison |
| `/products` | Catalogue particulier avec prix standards |
| `/products/[id]` | Détail produit et ajout au panier |
| `/cart` | Panier particulier |
| `/checkout` | Passage de commande particulier |
| `/register` | Inscription client particulier |
| `/login` | Connexion client particulier |
| `/orders/[id]` | Suivi du statut de commande |

### Espace professionnel

| Route | Description |
| --- | --- |
| `/pro/login` | Connexion professionnel |
| `/pro/products` | Catalogue B2B avec prix C/D/E/F |
| `/pro/products/[id]` | Détail produit professionnel |
| `/pro/cart` | Panier professionnel |
| `/pro/quotes/[id]` | Consultation et validation du devis / proforma |
| `/pro/orders` | Historique des commandes professionnelles |
| `/pro/invoices` | Liste et téléchargement des factures |

Les routes `/pro/*` doivent être protégées par middleware Next.js. Toute requête non authentifiée redirige vers `/pro/login`.

## Règles métier principales

- Les clients particuliers voient les prix standards.
- Les clients professionnels voient les prix de leur niveau tarifaire : C, D, E ou F.
- Le niveau C correspond au tarif professionnel le moins cher.
- Le niveau F correspond au tarif professionnel le plus élevé.
- Les comptes B2B sont créés par l'administrateur, jamais en self-service.
- Les commandes B2B réutilisent le modèle `Order` existant.
- `PENDING` représente un devis / proforma.
- `CONFIRMED` représente une commande ferme.
- Les paniers sont stockés en `localStorage`.
- Le panier particulier utilise la clé `retail_cart`.
- Le panier professionnel utilise la clé `pro_cart`.

## Périmètre fonctionnel

### Inclus dans la première version

- catalogue produit public ;
- catalogue produit professionnel ;
- gestion des clients particuliers ;
- gestion des clients professionnels ;
- prix standards ;
- prix par niveau tarifaire ;
- commandes ;
- factures ;
- avoirs ;
- modes de paiement ;
- adresses de livraison ;
- pages optimisées SEO ;
- distinction claire entre parcours particulier et parcours professionnel.

### Non inclus dans la première version

- application mobile native ;
- programme de fidélité avancé ;
- amélioration d'images produits par IA ;
- connexion avec transporteurs externes ;
- comptabilité avancée complète ;
- gestion avancée de l'équipe.

## Stack technique

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (`@base-ui/react`)
- Zod
- jose pour la vérification des JWT cookies
- date-fns
- Vitest
- Playwright

> **Pas de Prisma, pas de PostgreSQL, pas de bcryptjs dans ce repo.** Ce front-end est un **pur client REST** du back-end `AlimExpressApp`.

## Accès aux données : client REST de l'API v1

Ce projet ne possède **aucune base de données**. Toutes les données transitent par l'API REST du back-end `AlimExpressApp` (`/api/v1/*`).

- Tous les appels serveur passent par `backendFetch` (`lib/api-client.ts`), qui lit le JWT du cookie `catalog_session` et le relaie en `Authorization: Bearer <token>`.
- Les server actions de `actions/` sont le point d'appel privilégié (éviter les fetch côté client).
- L'authentification (login, inscription, hachage des mots de passe) est gérée par le back-end. Ce repo se contente de stocker et vérifier le JWT.

Configuration (cf. `.env.example`) :

```bash
BACKEND_URL="http://localhost:3000"   # base URL du back-end (server-only)
AUTH_SECRET="..."                      # secret JWT partagé, identique au back-end
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application démarre par défaut sur :

```text
http://localhost:3000
```

## Vérifications

```bash
npm run lint
npm run build
```

## Prochaines étapes

- brancher l'authentification retail et professionnelle ;
- construire les routes publiques ;
- construire les routes `/pro/*` protégées ;
- connecter les produits, prix, commandes, devis et factures via l'API v1 du back-end ;
- ajouter les tests Vitest et Playwright sur les parcours critiques.
