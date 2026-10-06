/**
 * Modèle d'autorisation de l'API.
 *
 * Le back-office est ouvert aux employés, pas seulement aux administrateurs.
 * La règle est la suivante :
 *
 *  - le catalogue se consulte sans session (la boutique Symfony en dépend) ;
 *  - un employé authentifié alimente le catalogue et les stocks ;
 *  - les suppressions, les remises, les mouvements de stock, les utilisateurs
 *    et les bons de commande sont réservés au rôle « admin ».
 *
 * Les comptes ne pouvant être créés que par un administrateur (l'instance Clerk
 * est en inscription restreinte), « authentifié » équivaut bien à « employé ».
 *
 * Cette spec fige ce contrat : elle vérifie autant ce qu'un employé peut faire
 * que ce qui doit lui être refusé.
 */
describe("Modèle d'autorisation", {testIsolation: false}, () => {
    const suffix = Date.now();
    const employeeBrand = `Marque employe ${suffix}`;
    const employeeBrandSlug = `marque-employe-${suffix}`;

    // Identifiant bien formé mais inexistant : le contrôle de rôle doit répondre
    // avant toute recherche en base, sans rien révéler ni modifier.
    const ABSENT_OBJECT_ID = "000000000000000000000000";

    let referenceBrand: {name: string; slug: string};

    before(() => {
        cy.apiRequest<{data: Array<{name: string; slug: string}>}>({url: "/brands?limit=1"}).then(
            (res) => {
                expect(res.status).to.eq(200);
                referenceBrand = res.body.data[0];
            },
        );
    });

    describe("Employé authentifié", () => {
        beforeEach(() => {
            cy.signInAsViewer();
        });

        it("consulte le catalogue", () => {
            cy.apiRequest({url: "/products"}).its("status").should("eq", 200);
            cy.apiRequest({url: "/brands"}).its("status").should("eq", 200);
            cy.apiRequest({url: "/categories"}).its("status").should("eq", 200);
        });

        it("consulte les stocks", () => {
            cy.apiRequest({url: "/stocks"}).its("status").should("eq", 200);
        });

        it("crée une marque", () => {
            cy.apiRequest<{slug: string}>({
                method: "POST",
                url: "/brands",
                body: {name: employeeBrand, active: true},
            }).then((res) => {
                expect(res.status, "création autorisée").to.eq(201);
                expect(res.body.slug).to.eq(employeeBrandSlug);
            });
        });

        it("modifie une marque existante", () => {
            // Le nom transmis est celui déjà enregistré : la route ne met alors
            // aucun champ à jour, seule l'autorisation est mise à l'épreuve.
            cy.apiRequest({
                method: "PATCH",
                url: `/brands/${referenceBrand.slug}`,
                body: {name: referenceBrand.name},
            })
                .its("status")
                .should("eq", 200);
        });

        it("ne peut pas supprimer une marque", () => {
            cy.apiRequest({method: "DELETE", url: `/brands/${referenceBrand.slug}`})
                .its("status")
                .should("eq", 403);
        });

        it("ne peut pas supprimer une catégorie", () => {
            cy.apiRequest({method: "DELETE", url: "/categories/categorie-inexistante"})
                .its("status")
                .should("eq", 403);
        });

        it("ne peut pas créer de remise", () => {
            cy.apiRequest({
                method: "POST",
                url: "/discounts",
                body: {
                    productId: ABSENT_OBJECT_ID,
                    discountAmount: 10,
                    discountType: "PERCENTAGE",
                    active: true,
                },
            })
                .its("status")
                .should("eq", 403);
        });

        it("ne peut pas supprimer de remise", () => {
            cy.apiRequest({method: "DELETE", url: `/discounts/${ABSENT_OBJECT_ID}`})
                .its("status")
                .should("eq", 403);
        });

        it("ne peut pas enregistrer de mouvement de stock", () => {
            // L'interface interdit déjà /admin/transactions à un non-administrateur
            // (proxy.ts) : l'API doit appliquer la même règle, sinon le contrôle
            // se contourne par un appel direct.
            cy.apiRequest({
                method: "POST",
                url: "/transactions",
                body: {
                    type: true,
                    oldQtt: 0,
                    newQtt: 5,
                    finalQuantity: 5,
                    productId: ABSENT_OBJECT_ID,
                },
            })
                .its("status")
                .should("eq", 403);
        });

        it("ne peut pas consulter l'historique des mouvements", () => {
            cy.apiRequest({url: "/transactions"}).its("status").should("eq", 403);
        });

        it("ne peut pas lister les utilisateurs", () => {
            cy.apiRequest({url: "/users"}).its("status").should("eq", 403);
        });

        it("ne peut pas lister les bons de commande", () => {
            cy.apiRequest({url: "/purchase-orders"}).its("status").should("eq", 403);
        });
    });

    describe("Administrateur", () => {
        beforeEach(() => {
            cy.signInAsAdmin();
        });

        it("accède aux ressources refusées à l'employé", () => {
            cy.apiRequest({url: "/transactions"}).its("status").should("eq", 200);
            cy.apiRequest({url: "/users"}).its("status").should("eq", 200);
            cy.apiRequest({url: "/purchase-orders"}).its("status").should("eq", 200);
        });

        it("franchit le contrôle de rôle sur un mouvement de stock", () => {
            // Le produit visé n'existe pas : la réponse 404 prouve que le rôle a
            // été accepté et que la requête a atteint la logique métier, sans
            // qu'aucun stock ne soit modifié.
            cy.apiRequest({
                method: "POST",
                url: "/transactions",
                body: {
                    type: true,
                    oldQtt: 0,
                    newQtt: 5,
                    finalQuantity: 5,
                    productId: ABSENT_OBJECT_ID,
                },
            })
                .its("status")
                .should("eq", 404);
        });

        it("supprime la marque créée par l'employé", () => {
            cy.apiRequest({url: `/brands/${employeeBrandSlug}`}).then((existing) => {
                if (existing.status !== 200) {
                    cy.log("Marque absente : création non aboutie, rien à nettoyer.");
                    return;
                }

                cy.apiRequest({method: "DELETE", url: `/brands/${employeeBrandSlug}`})
                    .its("status")
                    .should("be.oneOf", [200, 204]);
            });
        });
    });
});
