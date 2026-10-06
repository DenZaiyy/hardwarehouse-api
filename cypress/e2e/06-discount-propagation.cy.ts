/**
 * Propagation d'une remise de catégorie à tous ses produits.
 *
 * C'est le scénario le plus représentatif de l'application : une seule action
 * de gestion déclenche le recalcul du prix remisé de chaque produit rattaché à
 * la catégorie, en une transaction. Le test vérifie la propagation à la
 * création, puis le retour à l'état initial à la suppression.
 */
describe("Propagation d'une remise de catégorie", {testIsolation: false}, () => {
    const DISCOUNT_RATE = 10;

    let category: {id: string; name: string; slug: string};
    let products: Array<{id: string; slug: string; name: string; price: number}> = [];
    let discountId: string;

    before(() => {
        cy.signInAsAdmin();

        // On retient la première catégorie qui porte au moins deux produits :
        // la propagation n'a de sens que sur un ensemble.
        cy.apiRequest<{data: Array<{id: string; name: string; slug: string}>}>({
            url: "/categories",
        }).then((res) => {
            expect(res.status).to.eq(200);

            const candidates = res.body.data;
            expect(candidates, "des catégories existent").to.have.length.greaterThan(0);

            return cy
                .wrap(candidates, {log: false})
                .each((candidate: {id: string; name: string; slug: string}) => {
                    if (products.length >= 2) return;

                    cy.apiRequest<{data: typeof products}>({
                        url: `/categories/${candidate.slug}/products?limit=5`,
                    }).then((productsRes) => {
                        if (products.length < 2 && productsRes.body?.data?.length >= 2) {
                            category = candidate;
                            products = productsRes.body.data;
                        }
                    });
                })
                .then(() => {
                    // La catégorie comme ses produits doivent être exempts de
                    // remise pour que la propagation soit mesurable.
                    cy.purgeDiscounts({
                        categoryId: category.id,
                        productIds: products.map((entry) => entry.id),
                    });
                });
        });
    });

    it("dispose d'un jeu d'essai exploitable", () => {
        expect(category, "catégorie retenue").to.not.be.undefined;
        expect(products.length, "produits rattachés").to.be.greaterThan(1);
    });

    it("crée la remise sur la catégorie", () => {
        cy.visit("/admin/discounts/add");

        cy.selectOption("Catégorie", category.name);
        cy.selectOption("Type de remise", "Pourcentage (%)");
        cy.formField("Montant").clear().type(String(DISCOUNT_RATE));
        cy.contains("button", "Créer la remise").click();

        cy.expectToast("Remise créée avec succès.");
    });

    it("répercute le prix remisé sur chaque produit de la catégorie", () => {
        products.forEach((product) => {
            cy.apiRequest<{discountPrice: number; discountAmount: number; promote: boolean}>({
                url: `/products/${product.slug}`,
            }).then((res) => {
                const expected = Number(
                    (product.price - (product.price * DISCOUNT_RATE) / 100).toFixed(2),
                );

                expect(res.body.discountPrice, `prix remisé de « ${product.name} »`).to.eq(expected);
                expect(res.body.discountAmount).to.eq(DISCOUNT_RATE);
                expect(res.body.promote, `« ${product.name} » en promotion`).to.eq(true);
            });
        });
    });

    it("fait apparaître la remise dans la liste des remises", () => {
        cy.visit("/admin/discounts");

        cy.tableRow(category.name).should("be.visible");
        cy.tableRow(category.name).should("contain", "Oui"); // remise active

        // La collection expose la catégorie liée sous forme d'objet, et non
        // sous forme de clé étrangère scalaire.
        cy.apiRequest<{data: Array<{id: string; category: {id: string} | null}>}>({
            url: "/discounts",
        }).then((res) => {
            const created = res.body.data.find((entry) => entry.category?.id === category.id);
            expect(created, "remise retrouvée par l'API").to.not.be.undefined;
            discountId = created!.id;
        });
    });

    it("rend leur prix initial aux produits une fois la remise supprimée", () => {
        cy.apiRequest({method: "DELETE", url: `/discounts/${discountId}`})
            .its("status")
            .should("be.oneOf", [200, 204]);

        products.forEach((product) => {
            cy.apiRequest<{discountPrice: number | null; promote: boolean}>({
                url: `/products/${product.slug}`,
            }).then((res) => {
                expect(res.body.discountPrice, `remise retirée de « ${product.name} »`).to.eq(null);
                expect(res.body.promote).to.eq(false);
            });
        });
    });
});
