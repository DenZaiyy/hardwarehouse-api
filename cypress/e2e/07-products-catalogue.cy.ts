/**
 * Catalogue produits : consultation, filtres, tri et pagination.
 *
 * Ces règles sont partagées avec la boutique Symfony, qui consomme les mêmes
 * routes de lecture. Une régression sur la pagination ou sur la liste blanche
 * de tri se répercuterait directement sur le site public.
 */
describe("Catalogue produits", {testIsolation: false}, () => {
    before(() => {
        cy.signInAsAdmin();
    });

    describe("Contrat de pagination", () => {
        it("pagine par défaut à 25 éléments", () => {
            cy.apiRequest<{data: unknown[]; total: number; meta: Record<string, unknown>}>({
                url: "/products",
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.meta).to.include({page: 1, limit: 25});
                expect(res.body.data.length).to.be.at.most(25);
                expect(res.body.meta).to.have.all.keys(
                    "page",
                    "limit",
                    "totalPages",
                    "hasNext",
                    "hasPrev",
                );
            });
        });

        it("plafonne la taille de page à 50", () => {
            cy.apiRequest<{data: unknown[]; meta: {limit: number}}>({
                url: "/products?limit=200",
            }).then((res) => {
                expect(res.body.meta.limit, "plafond appliqué").to.eq(50);
                expect(res.body.data.length).to.be.at.most(50);
            });
        });

        it("ramène une page inférieure à 1 sur la première page", () => {
            cy.apiRequest<{meta: {page: number; hasPrev: boolean}}>({
                url: "/products?page=0",
            }).then((res) => {
                expect(res.body.meta.page).to.eq(1);
                expect(res.body.meta.hasPrev).to.eq(false);
            });
        });

        it("expose des pages cohérentes entre elles", () => {
            cy.apiRequest<{data: Array<{id: string}>; total: number; meta: {totalPages: number}}>({
                url: "/products?limit=5&page=1",
            }).then((first) => {
                if (first.body.meta.totalPages < 2) {
                    cy.log("Jeu de données trop court pour comparer deux pages.");
                    return;
                }

                cy.apiRequest<{data: Array<{id: string}>}>({url: "/products?limit=5&page=2"}).then(
                    (second) => {
                        const firstIds = first.body.data.map((item) => item.id);
                        const secondIds = second.body.data.map((item) => item.id);

                        expect(firstIds, "pages disjointes").to.not.have.members(secondIds);
                    },
                );
            });
        });
    });

    describe("Tri et filtres", () => {
        it("trie par prix croissant", () => {
            cy.apiRequest<{data: Array<{price: number}>}>({
                url: "/products?sortBy=price&order=asc&limit=50",
            }).then((res) => {
                const prices = res.body.data.map((item) => item.price);
                const sorted = [...prices].sort((a, b) => a - b);

                expect(prices).to.deep.eq(sorted);
            });
        });

        it("ignore un champ de tri hors liste blanche", () => {
            // parseSort n'accepte que createdAt, price et name : toute autre
            // valeur retombe sur le tri par défaut au lieu d'atteindre Prisma.
            cy.apiRequest<{data: unknown[]}>({
                url: "/products?sortBy=categoryId.injection&order=asc",
            }).then((res) => {
                expect(res.status, "aucune erreur serveur").to.eq(200);
                expect(res.body.data).to.be.an("array");
            });
        });

        it("filtre sur un terme de recherche", () => {
            cy.apiRequest<{data: Array<{name: string}>}>({url: "/products?limit=1"}).then(
                (sample) => {
                    const term = sample.body.data[0].name.split(" ")[0];

                    cy.apiRequest<{data: Array<{name: string}>; total: number}>({
                        url: `/products?search=${encodeURIComponent(term)}`,
                    }).then((res) => {
                        expect(res.status).to.eq(200);
                        expect(res.body.total).to.be.greaterThan(0);
                    });
                },
            );
        });

        it("filtre sur une marque par son slug", () => {
            cy.apiRequest<{data: Array<{slug: string; name: string}>}>({url: "/brands"}).then(
                (brands) => {
                    const brand = brands.body.data[0];

                    cy.apiRequest<{data: Array<{brand: {slug: string}}>}>({
                        url: `/products?brands=${brand.slug}&limit=50`,
                    }).then((res) => {
                        expect(res.status).to.eq(200);
                        res.body.data.forEach((product) => {
                            expect(product.brand.slug).to.eq(brand.slug);
                        });
                    });
                },
            );
        });
    });

    describe("Tableau d'administration", () => {
        it("filtre les lignes affichées", () => {
            cy.apiRequest<{data: Array<{name: string}>}>({url: "/products?limit=1"}).then(
                (sample) => {
                    const name = sample.body.data[0].name;

                    cy.visit("/admin/products");
                    cy.get('input[placeholder="Filtrer les produits..."]').type(name);

                    cy.get("tbody tr").should("have.length.at.least", 1);
                    cy.tableRow(name).should("be.visible");
                },
            );
        });

        it("n'affiche aucune ligne pour un filtre sans correspondance", () => {
            cy.visit("/admin/products");
            cy.get('input[placeholder="Filtrer les produits..."]').type("zzz-aucun-produit-zzz");

            cy.contains("Aucun résultat.").should("be.visible");
        });

        it("change le nombre de lignes par page", () => {
            cy.visit("/admin/products");

            cy.contains("Lignes par page")
                .parent()
                .find('[role="combobox"]')
                .click();
            cy.contains('[role="option"]', "10").click();

            cy.get("tbody tr").should("have.length.at.most", 10);
        });
    });
});
