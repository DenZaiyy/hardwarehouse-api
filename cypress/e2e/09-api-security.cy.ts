/**
 * Sécurité et contrat de l'API.
 *
 * Ces routes sont consommées par la boutique Symfony : leur forme de réponse
 * comme leurs refus font partie du contrat public. Les tests couvrent les
 * quatre garde-fous : session exigée, rôle exigé, erreurs normalisées, et
 * limitation du débit.
 *
 * Le dernier bloc consomme volontairement le quota de requêtes : il est placé
 * en fin de fichier pour ne pas perturber les scénarios précédents.
 */
describe("Sécurité de l'API", () => {
    describe("Sans session", () => {
        it("refuse la suppression d'une marque", () => {
            cy.apiRequest({method: "DELETE", url: "/brands/marque-inexistante"})
                .its("status")
                .should("eq", 401);
        });

        it("refuse la modification d'un produit", () => {
            cy.apiRequest({
                method: "PATCH",
                url: "/products/produit-inexistant",
                body: {name: "Tentative"},
            })
                .its("status")
                .should("eq", 401);
        });

        it("laisse le catalogue accessible en lecture", () => {
            // La boutique publique consomme ces routes sans session.
            cy.apiRequest({url: "/products"}).its("status").should("eq", 200);
            cy.apiRequest({url: "/brands"}).its("status").should("eq", 200);
        });
    });

    describe("Avec une session sans le rôle administrateur", () => {
        beforeEach(() => {
            cy.signInAsViewer();
        });

        it("refuse la suppression d'une marque avec un 403", () => {
            cy.apiRequest<{error: string}>({
                method: "DELETE",
                url: "/brands/marque-inexistante",
            }).then((res) => {
                // Le contrôle de rôle précède la recherche en base : la réponse
                // ne révèle donc pas l'existence de la ressource.
                expect(res.status).to.eq(403);
                expect(res.body.error).to.contain("administrateurs");
            });
        });

        it("refuse la consultation des utilisateurs", () => {
            cy.apiRequest({url: "/users"}).its("status").should("be.oneOf", [401, 403]);
        });
    });

    describe("Normalisation des erreurs", () => {
        beforeEach(() => {
            cy.signInAsAdmin();
        });

        it("renvoie un 404 documenté sur une ressource absente", () => {
            cy.apiRequest<{error: string; code: string}>({
                url: "/brands/marque-vraiment-inexistante",
            }).then((res) => {
                expect(res.status).to.eq(404);
                expect(res.body).to.have.property("code", "NOT_FOUND");
                expect(res.body.error).to.be.a("string");
            });
        });

        it("renvoie un 400 sur une remise invalide", () => {
            cy.apiRequest<{code: string}>({
                method: "POST",
                url: "/discounts",
                body: {discountAmount: 10, discountType: "PERCENTAGE", active: true},
            }).then((res) => {
                expect(res.status).to.eq(400);
                expect(res.body).to.have.property("code", "BAD_REQUEST");
            });
        });

        it("rejette un identifiant mal formé sans exposer d'erreur interne", () => {
            cy.apiRequest({url: "/discounts/pas-un-object-id"}).then((res) => {
                expect(res.status, "pas de 500").to.not.eq(500);
            });
        });
    });

    describe("En-tête d'appel interne", () => {
        it("ignore un secret interne invalide et conserve la pagination", () => {
            // Sans cette vérification, un appelant pourrait aspirer le catalogue
            // entier en devinant l'existence de l'en-tête.
            cy.apiRequest<{meta?: {limit: number}}>({
                url: "/brands",
                headers: {"x-internal-request": "secret-invalide"},
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.meta, "pagination maintenue").to.not.be.undefined;
            });
        });
    });

    describe("Pages d'administration", () => {
        beforeEach(() => {
            cy.signInAsAdmin();
        });

        it("interdit l'indexation du back-office", () => {
            cy.visit("/admin/products");

            cy.get('head meta[name="robots"]', {includeShadowDom: true})
                .should("have.attr", "content")
                .and("match", /noindex/);
        });
    });

    describe("Limitation du débit", () => {
        beforeEach(() => {
            cy.signInAsAdmin();
        });

        it("bloque les créations répétées au-delà du quota", () => {
            // Le quota est de 10 requêtes par minute et par IP sur les routes
            // d'écriture exposées. La onzième doit être refusée.
            const attempts = Array.from({length: 12}, (_, index) => index);
            const statuses: number[] = [];

            cy.wrap(attempts).each((index: number) => {
                cy.apiRequest({
                    method: "POST",
                    url: "/categories",
                    body: {name: `Quota E2E ${Date.now()}-${index}`, active: false},
                }).then((res) => {
                    statuses.push(res.status);
                });
            });

            cy.then(() => {
                expect(statuses, "une requête au moins refusée pour dépassement").to.include(429);
            });
        });

        after(() => {
            // Les catégories créées avant le déclenchement du quota sont retirées.
            cy.signInAsAdmin();
            cy.apiRequest<{data: Array<{slug: string; name: string}>}>({
                url: "/categories?limit=50",
            }).then((res) => {
                if (res.status !== 200) return;

                res.body.data
                    .filter((category) => category.name.startsWith("Quota E2E"))
                    .forEach((category) => {
                        cy.apiRequest({method: "DELETE", url: `/categories/${category.slug}`});
                    });
            });
        });
    });
});
