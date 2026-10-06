# Tests de bout en bout

Suite Cypress couvrant le back-office et le contrat de l'API `/api/v1`.

## Prérequis

1. **L'application doit tourner** sur `http://localhost:3000` (`npm run dev`).
   Une autre URL se déclare avec `CYPRESS_BASE_URL`.
2. **La base doit contenir le jeu de données de départ** (`npm run db:seed`).
   Les parcours s'appuient sur des produits, catégories, marques et stocks existants ;
   ils ne créent que les données propres à leur scénario et les suppriment ensuite.
3. **Les comptes de test Clerk** doivent exister et leurs identifiants être connus de Cypress.
4. **Upstash Redis doit être joignable** : les routes d'écriture appellent le limiteur
   de débit avant toute autre logique.

## Comptes de test

Deux comptes dédiés vivent dans l'instance Clerk de développement :

| Rôle | Identifiant | Usage |
|---|---|---|
| Administrateur | `e2e.admin+clerk_test@example.com` (`e2e_admin`) | `publicMetadata.role = "admin"`, accède à tout |
| Employé | `e2e.viewer+clerk_test@example.com` (`e2e_viewer`) | sans rôle admin, sert à vérifier le modèle d'autorisation |

Le suffixe `+clerk_test` en fait des **identifiants de test Clerk** : la vérification par
code accepte `424242` et aucun courriel n'est réellement envoyé.

Leurs mots de passe sont lus depuis `cypress.env.json`, **ignoré par Git** :

```json
{
  "E2E_ADMIN_EMAIL": "e2e.admin+clerk_test@example.com",
  "E2E_ADMIN_PASSWORD": "…",
  "E2E_VIEWER_EMAIL": "e2e.viewer+clerk_test@example.com",
  "E2E_VIEWER_PASSWORD": "…"
}
```

En intégration continue, passer les mêmes valeurs par variables d'environnement
préfixées `CYPRESS_` (`CYPRESS_E2E_ADMIN_PASSWORD`, etc.), ainsi que
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dont `clerkSetup()` a besoin
pour obtenir un Testing Token.

### Recréer les comptes

Depuis le tableau de bord Clerk (**Users > Create user**), avec un nom d'utilisateur
(l'instance l'exige), un mot de passe, et pour l'administrateur la métadonnée publique :

```json
{ "role": "admin" }
```

## Authentification dans les tests

L'instance réclame un **second facteur `email_code`** après le mot de passe.
`cy.clerkSignIn` fourni par `@clerk/testing` ne couvre que le premier facteur et
échouerait sans message : la commande `cy.signInAsAdmin()` déroule donc le flux complet
(`signIn.create` → `prepareSecondFactor` → `attemptSecondFactor` avec `424242` → `setActive`).
Si la politique de l'instance change, une connexion aboutissant directement fonctionne aussi.

## Exécution

```bash
npm run dev          # dans un terminal
npm run cypress:run  # dans un autre, ou npm run cypress:open
```

Une spec isolée :

```bash
npx cypress run --e2e --spec cypress/e2e/05-discounts.cy.ts
```

## Organisation

| Spec | Objet |
|---|---|
| `01-authentication` | redirections, rôles, refus API sans session, déconnexion |
| `02-navigation` | accès à chaque section depuis la barre latérale |
| `03-brands-crud` | cycle de vie complet d'une marque |
| `04-categories-crud` | cycle de vie complet d'une catégorie |
| `05-discounts` | remise produit, prix recalculé, refus du doublon actif |
| `06-discount-propagation` | remise de catégorie répercutée sur tous ses produits |
| `07-products-catalogue` | pagination, tri, filtres, tableau d'administration |
| `08-stock-movements` | entrée et sortie de stock, refus du stock négatif |
| `09-api-security` | 401 / 403 / 404 / 400, en-tête interne, limitation de débit |
| `10-authorization-model` | ce qu'un employé peut faire, ce qui reste réservé aux admins |

Les specs de gestion désactivent `testIsolation` : chaque étape prolonge la précédente,
comme un parcours réel. Les données créées portent un horodatage et sont supprimées
par la dernière étape, si bien que la suite peut être rejouée indéfiniment.

## Conventions de sélection

Aucun attribut `data-testid` n'a été ajouté au code de production. Les commandes
s'appuient sur le DOM accessible : association `label` / champ, rôles ARIA (`combobox`,
`option`, `menuitem`, `alertdialog`, `status`) et libellés visibles.

| Commande | Rôle |
|---|---|
| `cy.signInAsAdmin()` / `cy.signInAsViewer()` | ouvre une session applicative |
| `cy.apiRequest({url})` | appelle `/api/v1` sans faire échouer le test sur le statut |
| `cy.formField(label)` | retourne le champ associé à un libellé |
| `cy.selectOption(label, option)` | choisit une valeur dans une liste Radix |
| `cy.tableRow(texte)` / `cy.rowAction(texte, action)` | cible une ligne et son menu |
| `cy.expectToast(message)` | vérifie une notification |
| `cy.purgeDiscounts({...})` | remet les remises à zéro avant un scénario |

## Limites connues

Trois tests échouent aujourd'hui pour des raisons extérieures à la suite. Ils décrivent
le comportement attendu et n'ont volontairement pas été alignés sur le comportement actuel.

1. **`09-api-security` › limitation du débit.** La base Upstash déclarée dans
   `.env.local` n'existe plus (`ENOTFOUND`). Toute route appelant `rateLimiter.limit()`
   renvoie alors une 500 au lieu d'appliquer le quota. Le test redeviendra vert dès
   qu'une base Redis joignable sera configurée. Sont concernées : création de marque,
   de catégorie, de produit, de stock, les téléversements, et la lecture des transactions.
2. **`09-api-security` › identifiant mal formé.** `GET /api/v1/discounts/pas-un-object-id`
   répond 500 : l'erreur Prisma sur un ObjectId invalide n'est pas convertie en erreur
   métier. La réponse attendue serait 400 ou 404.
3. **`10-authorization-model` › création d'une marque par un employé.** Même cause que le
   point 1 : `POST /api/v1/brands` passe par le limiteur de débit. Les quatorze autres
   tests de cette spec ne dépendent pas de Redis et passent.
