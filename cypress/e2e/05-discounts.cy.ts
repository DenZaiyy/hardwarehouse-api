/**
 * Remises : la règle métier la plus structurante de l'application.
 *
 * Une remise ne se contente pas d'exister en base. Sa création déclenche le
 * recalcul du prix remisé de chaque produit concerné (`refreshProductDiscount`),
 * et l'API refuse qu'un même produit porte deux remises actives simultanées.
 * Ce parcours vérifie l'effet de bord attendu sur le produit, pas seulement
 * l'enregistrement de la remise.
 */
describe("Gestion des remises", {testIsolation: false}, () => {
    let product: {id: string; name: string; slug: string; price: number};

    before(() => {
        cy.signInAsAdmin();

        // Le jeu de données est fourni par `npm run db:seed` : on s'appuie sur
        // un produit existant plutôt que d'en créer un pour ce parcours.
        cy.apiRequest<{data: Array<typeof product>}>({url: "/products?limit=1"}).then((res) => {
            expect(res.status, "le catalogue répond").to.eq(200);
            expect(res.body.data, "au moins un produit en base").to.have.length.greaterThan(0);
            product = res.body.data[0];
        }).then(() => {
            // Un résidu d'une exécution précédente provoquerait un conflit 409
            // et fausserait les prix attendus.
            cy.purgeDiscounts({productIds: [product.id]});
        });
    });

    it("refuse une remise sans produit ni catégorie", () => {
        cy.visit("/admin/discounts/add");

        cy.formField("Montant").clear().type("10");
        cy.contains("button", "Créer la remise").click();

        cy.contains("Il faut renseigner soit un produit, soit une catégorie").should("be.visible");
    });

    it("bloque un pourcentage supérieur à 100 dès le formulaire", () => {
        cy.visit("/admin/discounts/add");

        cy.selectOption("Produit", product.name);
        cy.formField("Montant").clear().type("150");
        cy.contains("button", "Créer la remise").click();

        // Le champ porte `max=100` : la contrainte native du navigateur arrête
        // la soumission avant même la validation Zod du formulaire.
        cy.formField("Montant").then(($input) => {
            const field = $input[0] as HTMLInputElement;
            expect(field.checkValidity(), "champ invalide côté navigateur").to.eq(false);
            expect(field.validity.rangeOverflow, "dépassement de la borne haute").to.eq(true);
        });

        cy.location("pathname").should("eq", "/admin/discounts/add");
    });

    it("refuse un pourcentage supérieur à 100 côté serveur", () => {
        // La barrière qui compte : contourner l'interface ne doit rien changer.
        cy.apiRequest({
            method: "POST",
            url: "/discounts",
            body: {
                productId: product.id,
                discountAmount: 150,
                discountType: "PERCENTAGE",
                active: true,
            },
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body).to.have.property("code", "BAD_REQUEST");
        });
    });

    it("crée une remise de 20 % sur un produit", () => {
        cy.visit("/admin/discounts/add");

        cy.selectOption("Produit", product.name);
        cy.selectOption("Type de remise", "Pourcentage (%)");
        cy.formField("Montant").clear().type("20");
        cy.contains("button", "Créer la remise").click();

        cy.expectToast("Remise créée avec succès.");
    });

    it("applique le prix remisé au produit", () => {
        // Vérification par l'API : c'est le contrat consommé par la boutique.
        // Cette route renvoie le produit sans enveloppe « data », à la
        // différence des routes de collection.
        cy.apiRequest<{discountPrice: number; discountAmount: number; promote: boolean}>({
            url: `/products/${product.slug}`,
        }).then((res) => {
            expect(res.status).to.eq(200);

            const expected = Number((product.price - (product.price * 20) / 100).toFixed(2));
            expect(res.body.discountPrice, "prix remisé recalculé").to.eq(expected);
            expect(res.body.discountAmount).to.eq(20);
            expect(res.body.promote, "produit marqué en promotion").to.eq(true);
        });
    });

    it("affiche la promotion dans la liste des produits", () => {
        cy.visit("/admin/products");
        cy.get('input[placeholder="Filtrer les produits..."]').type(product.name);

        cy.tableRow(product.name).should("contain", "Oui"); // colonne « En promo »

        // Le pourcentage est mis en forme en fr-FR : l'espace avant le signe
        // est une espace insécable, d'où la comparaison souple.
        cy.tableRow(product.name)
            .invoke("text")
            .should("match", /20\s*%/);
    });

    it("refuse une seconde remise active sur le même produit", () => {
        cy.apiRequest({
            method: "POST",
            url: "/discounts",
            body: {
                productId: product.id,
                discountAmount: 30,
                discountType: "PERCENTAGE",
                active: true,
                startDate: new Date().toISOString(),
            },
        }).then((res) => {
            expect(res.status, "conflit signalé").to.eq(409);
            expect(res.body).to.have.property("code", "PRODUCT_DISCOUNT_ALREADY_EXISTS");
        });
    });

    it("supprime la remise et rend son prix initial au produit", () => {
        cy.visit("/admin/discounts");

        cy.rowAction(product.name, "Supprimer");
        cy.get('[role="alertdialog"]').should("be.visible");
        cy.get('[role="alertdialog"]').contains("button", "Confirmer").click();

        cy.expectToast("Remise supprimée avec succès");

        cy.apiRequest<{discountPrice: number | null; promote: boolean}>({
            url: `/products/${product.slug}`,
        }).then((res) => {
            expect(res.body.discountPrice, "prix remisé effacé").to.eq(null);
            expect(res.body.promote, "promotion retirée").to.eq(false);
        });
    });
});
