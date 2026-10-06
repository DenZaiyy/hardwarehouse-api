/**
 * Mouvements de stock.
 *
 * Une transaction ne se contente pas d'être enregistrée : elle ajuste la
 * quantité du stock rattaché au produit. Le parcours ajoute une quantité, la
 * retire ensuite, et vérifie le retour exact à l'état de départ. Il est donc
 * rejouable sans dériver le jeu de données.
 */
describe("Mouvements de stock", {testIsolation: false}, () => {
    const MOVEMENT = 3;

    interface StockRow {
        id: string;
        quantity: number;
        product: {id: string; name: string; slug: string};
    }

    let stock: StockRow;
    let initialQuantity: number;

    const readStock = () =>
        cy.apiRequest<StockRow[]>({url: "/stocks"}).then((res) => {
            expect(res.status, "les stocks répondent").to.eq(200);
            return res.body.find((entry) => entry.id === stock.id)!;
        });

    before(() => {
        cy.signInAsAdmin();

        cy.apiRequest<StockRow[]>({url: "/stocks"}).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body, "au moins un stock en base").to.have.length.greaterThan(0);

            // Un stock suffisamment fourni pour supporter un retrait.
            stock = res.body.find((entry) => entry.quantity >= MOVEMENT) ?? res.body[0];
            initialQuantity = stock.quantity;
        });
    });

    it("liste les stocks dans l'administration", () => {
        cy.visit("/admin/stocks");

        cy.contains("h1", "Gestion des stocks").should("be.visible");
        cy.tableRow(stock.product.name).should("be.visible");
    });

    it("enregistre une entrée de stock", () => {
        cy.visit("/admin/transactions/add");

        cy.selectOption("Produit", stock.product.name);

        // La quantité actuelle est reportée automatiquement, en lecture seule.
        cy.formField("Quantité actuelle").should("be.disabled");
        cy.formField("Quantité à ajouter").clear().type(String(MOVEMENT));
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Transaction créé avec succès.");
    });

    it("incrémente la quantité en stock", () => {
        readStock().then((updated) => {
            expect(updated.quantity, "quantité après entrée").to.eq(initialQuantity + MOVEMENT);
        });
    });

    it("enregistre une sortie de stock et revient à l'état initial", () => {
        cy.visit("/admin/transactions/add");

        // Le commutateur bascule la transaction de « positive » à « négative ».
        cy.contains('[data-slot="form-item"]', "Transaction positive")
            .find('[role="switch"]')
            .click();

        cy.selectOption("Produit", stock.product.name);
        cy.formField("Quantité à retirer").clear().type(String(MOVEMENT));
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Transaction créé avec succès.");

        readStock().then((restored) => {
            expect(restored.quantity, "quantité rétablie").to.eq(initialQuantity);
        });
    });

    it("refuse une sortie supérieure au stock disponible", () => {
        cy.visit("/admin/transactions/add");

        cy.contains('[data-slot="form-item"]', "Transaction positive")
            .find('[role="switch"]')
            .click();

        cy.selectOption("Produit", stock.product.name);
        cy.formField("Quantité à retirer")
            .clear()
            .type(String(initialQuantity + 1_000));
        cy.contains("button", "Envoyer").click();

        cy.expectToast("La quantité finale ne peut pas être négative.");

        readStock().then((unchanged) => {
            expect(unchanged.quantity, "stock inchangé").to.eq(initialQuantity);
        });
    });
});
