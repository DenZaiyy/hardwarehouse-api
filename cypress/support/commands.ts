/// <reference types="cypress" />

/**
 * Commandes métier partagées par les tests de bout en bout.
 *
 * Les sélecteurs s'appuient sur le DOM accessible réellement produit par
 * l'application (association label / champ via `htmlFor`, rôles ARIA de Radix,
 * libellés visibles). Aucun attribut de test n'a été ajouté au code de
 * production : la suite vérifie donc l'interface telle qu'un utilisateur
 * la perçoit, et reste valable si l'implémentation interne change.
 */

import {setupClerkTestingToken} from "@clerk/testing/cypress";

export {};

/**
 * Code de vérification réservé par Clerk aux identifiants de test
 * (adresses contenant « +clerk_test »). Aucun message n'est réellement envoyé.
 */
const CLERK_TEST_CODE = "424242";

interface SignInFactor {
    strategy: string;
    emailAddressId?: string;
}

interface SignInAttempt {
    status: string | null;
    createdSessionId: string | null;
    supportedSecondFactors?: SignInFactor[] | null;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /** Connecte le compte de test disposant du rôle « admin ». */
            signInAsAdmin(): Chainable<void>;

            /** Connecte un compte authentifié mais sans le rôle « admin ». */
            signInAsViewer(): Chainable<void>;

            /** Appelle l'API interne. Le statut n'est jamais fatal : c'est au test d'assertir. */
            apiRequest<T = unknown>(
                options: Partial<Cypress.RequestOptions> & {url: string},
            ): Chainable<Cypress.Response<T>>;

            /** Retourne le champ associé à un libellé de formulaire. */
            formField(label: string): Chainable<JQuery<HTMLElement>>;

            /** Sélectionne une option dans une liste déroulante Radix. */
            selectOption(label: string, optionLabel: string | RegExp): Chainable<void>;

            /** Retourne la ligne de tableau contenant le texte donné. */
            tableRow(text: string | RegExp): Chainable<JQuery<HTMLElement>>;

            /** Ouvre le menu d'actions d'une ligne et déclenche l'action nommée. */
            rowAction(rowText: string, action: string): Chainable<void>;

            /** Vérifie qu'une notification contenant ce message est affichée. */
            expectToast(message: string | RegExp): Chainable<void>;

            /**
             * Supprime les remises visant une catégorie ou des produits donnés,
             * afin qu'un test reparte d'un état connu.
             */
            purgeDiscounts(match: {categoryId?: string; productIds?: string[]}): Chainable<void>;
        }
    }
}

function requiredEnv(name: string): string {
    const value = Cypress.env(name);

    if (!value) {
        throw new Error(
            `Variable Cypress « ${name} » absente. ` +
            `Renseignez-la dans cypress.env.json (local) ou via CYPRESS_${name} (CI). ` +
            `Voir cypress/README.md.`,
        );
    }

    return value as string;
}

/**
 * Établit une session applicative pour un compte de test.
 *
 * L'instance Clerk du projet réclame un second facteur « email_code » après la
 * vérification du mot de passe. `cy.clerkSignIn` ne couvre pas ce cas (le
 * paquet officiel ne gère que le premier facteur) et échouerait en silence :
 * le flux complet est donc déroulé ici, puis la session est activée.
 *
 * Le second facteur reste conditionnel : si la politique de l'instance change,
 * une connexion aboutissant directement à « complete » fonctionne toujours.
 */
function signInWithPassword(emailKey: string, passwordKey: string) {
    const identifier = requiredEnv(emailKey);
    const password = requiredEnv(passwordKey);

    // Injecte le Testing Token dans les appels à l'API Clerk, sans quoi la
    // protection anti-bot rejette une connexion automatisée.
    setupClerkTestingToken();

    // Repartir d'un navigateur vierge : appeler signIn.create alors qu'une
    // session est déjà active échoue avec « session_exists ». Le cas se produit
    // dès qu'une spec conserve son contexte entre les tests.
    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    // Clerk doit être chargé, sur une page publique : la racine du site porte
    // le ClerkProvider sans être protégée par proxy.ts.
    cy.visit("/");
    cy.window().should((win) => {
        expect(win.Clerk?.loaded, "Clerk est chargé").to.eq(true);
    });

    cy.window().then((win) => {
        const clerk = win.Clerk;
        const signIn = clerk.client!.signIn;

        return signIn
            .create({strategy: "password", identifier, password})
            .then(async (created) => {
                let attempt = created as unknown as SignInAttempt;

                if (attempt.status === "needs_second_factor") {
                    const emailFactor = attempt.supportedSecondFactors?.find(
                        (factor) => factor.strategy === "email_code",
                    );

                    if (!emailFactor?.emailAddressId) {
                        throw new Error(
                            "Second facteur non automatisable : " +
                            `${JSON.stringify(attempt.supportedSecondFactors)}. ` +
                            "Les comptes de test doivent utiliser une adresse « +clerk_test ».",
                        );
                    }

                    await signIn.prepareSecondFactor({
                        strategy: "email_code",
                        emailAddressId: emailFactor.emailAddressId,
                    } as never);

                    attempt = (await signIn.attemptSecondFactor({
                        strategy: "email_code",
                        code: CLERK_TEST_CODE,
                    } as never)) as unknown as SignInAttempt;
                }

                if (attempt.status !== "complete" || !attempt.createdSessionId) {
                    throw new Error(
                        `Connexion incomplète pour ${identifier} (statut « ${attempt.status} »).`,
                    );
                }

                await clerk.setActive({session: attempt.createdSessionId});
            });
    });

    // La session doit être visible côté client avant toute navigation protégée.
    cy.window().its("Clerk.user.id").should("be.a", "string");
}

Cypress.Commands.add("signInAsAdmin", () => {
    signInWithPassword("E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD");
});

Cypress.Commands.add("signInAsViewer", () => {
    signInWithPassword("E2E_VIEWER_EMAIL", "E2E_VIEWER_PASSWORD");
});

Cypress.Commands.add("apiRequest", (options) => {
    return cy.request({
        failOnStatusCode: false,
        ...options,
        url: `/api/v1${options.url}`,
    });
});

Cypress.Commands.add("formField", (label: string) => {
    return cy
        .contains("label", label)
        .should("have.attr", "for")
        .then((attr) => {
            // React 19 génère des identifiants contenant des caractères non
            // valides en sélecteur CSS : ils doivent être échappés.
            const id = String(attr);
            return cy.get(`#${CSS.escape(id)}`);
        });
});

/**
 * Les listes déroulantes Radix ne passent pas toutes par `FormControl` dans
 * l'application : leur déclencheur ne porte donc pas l'identifiant visé par
 * l'attribut `for` du label. On le retrouve par son conteneur de champ, ce qui
 * reste valable dans les deux cas.
 */
Cypress.Commands.add("selectOption", (label: string, optionLabel: string | RegExp) => {
    cy.contains('[data-slot="form-item"] label', label)
        .closest('[data-slot="form-item"]')
        .find('[role="combobox"]')
        .click();

    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', optionLabel).click();
    cy.get('[role="listbox"]').should("not.exist");
});

Cypress.Commands.add("tableRow", (text: string | RegExp) => {
    return cy.contains("tbody tr", text);
});

Cypress.Commands.add("rowAction", (rowText: string, action: string) => {
    cy.tableRow(rowText).contains("button", "Ouvrir le menu").click();
    cy.get('[role="menu"]').should("be.visible");
    cy.contains('[role="menuitem"]', action).click();
});

Cypress.Commands.add("expectToast", (message: string | RegExp) => {
    // react-hot-toast expose chaque notification avec role="status".
    cy.contains('[role="status"]', message).should("be.visible");
});

/**
 * Une remise active déjà présente ferait échouer une création (conflit 409) et
 * fausserait les prix attendus. Cette purge garantit qu'un parcours de remise
 * peut être rejoué autant de fois que nécessaire, y compris après un échec.
 */
Cypress.Commands.add("purgeDiscounts", (match: {categoryId?: string; productIds?: string[]}) => {
    interface DiscountRow {
        id: string;
        product: {id: string} | null;
        category: {id: string} | null;
    }

    cy.apiRequest<{data: DiscountRow[]}>({url: "/discounts?limit=50"}).then((res) => {
        if (res.status !== 200) return;

        const targets = res.body.data.filter((discount) => {
            const matchesCategory =
                !!match.categoryId && discount.category?.id === match.categoryId;
            const matchesProduct =
                !!match.productIds &&
                !!discount.product &&
                match.productIds.includes(discount.product.id);

            return matchesCategory || matchesProduct;
        });

        targets.forEach((discount) => {
            cy.apiRequest({method: "DELETE", url: `/discounts/${discount.id}`});
        });
    });
});
