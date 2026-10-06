/**
 * Contrôle d'accès à l'administration.
 *
 * Vérifie les deux niveaux de protection mis en place :
 *  - `proxy.ts` (middleware Clerk) : authentification exigée sur /admin,
 *    rôle « admin » exigé en plus sur /admin/users et /admin/transactions ;
 *  - les routes d'écriture de l'API, qui refusent une requête sans session.
 */
describe("Contrôle d'accès à l'administration", () => {
    describe("Visiteur anonyme", () => {
        it("redirige vers la page de connexion depuis le tableau de bord", () => {
            cy.visit("/admin");

            cy.location("pathname").should("eq", "/sign-in");
        });

        it("redirige vers la page de connexion depuis une page de gestion", () => {
            cy.visit("/admin/products");

            cy.location("pathname").should("eq", "/sign-in");
        });

        it("refuse une écriture sur l'API sans session", () => {
            cy.apiRequest({
                method: "POST",
                url: "/brands",
                body: {name: "Marque anonyme", active: true},
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it("refuse la consultation des utilisateurs sans session", () => {
            cy.apiRequest({url: "/users"}).its("status").should("eq", 401);
        });
    });

    describe("Administrateur authentifié", () => {
        beforeEach(() => {
            cy.signInAsAdmin();
        });

        it("accède au tableau de bord et y voit son identité", () => {
            cy.visit("/admin");

            cy.contains("h1", "Tableau de bord d'administration").should("be.visible");
            cy.contains("Vous êtes actuellement connecté sur").should("be.visible");
            cy.contains("e2e_admin").should("be.visible");
        });

        it("accède aux pages réservées au rôle administrateur", () => {
            cy.visit("/admin/users");
            cy.contains("h1", /Gestion des utilisateurs/i).should("be.visible");

            cy.visit("/admin/transactions");
            cy.contains("h1", "Liste des transactions").should("be.visible");
        });

        it("perd l'accès après déconnexion", () => {
            cy.visit("/admin");
            cy.contains("h1", "Tableau de bord d'administration").should("be.visible");

            // Déconnexion par le bouton de la barre latérale, comme un utilisateur.
            cy.contains("Se déconnecter").click();
            cy.location("pathname", {timeout: 20_000}).should("not.eq", "/admin");

            cy.visit("/admin");
            cy.location("pathname").should("eq", "/sign-in");
        });
    });

    describe("Utilisateur authentifié sans le rôle administrateur", () => {
        beforeEach(() => {
            cy.signInAsViewer();
        });

        it("atteint le tableau de bord, protégé par la seule authentification", () => {
            cy.visit("/admin");

            cy.contains("h1", "Tableau de bord d'administration").should("be.visible");
        });

        it("se voit refuser la gestion des utilisateurs", () => {
            cy.request({url: "/admin/users", failOnStatusCode: false})
                .its("status")
                .should("eq", 401);
        });

        it("se voit refuser l'historique des mouvements", () => {
            cy.request({url: "/admin/transactions", failOnStatusCode: false})
                .its("status")
                .should("eq", 401);
        });
    });
});
