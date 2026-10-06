/**
 * Cycle de vie complet d'une marque, du formulaire de création à la suppression.
 *
 * Les tests s'enchaînent volontairement sur une même donnée (testIsolation
 * désactivée) : c'est un parcours de gestion réel, où chaque étape dépend de la
 * précédente. Le nom porte un horodatage pour rester unique d'une exécution à
 * l'autre, et l'entité est supprimée par la dernière étape.
 */
describe("Gestion des marques", {testIsolation: false}, () => {
    const suffix = Date.now();
    const brandName = `Marque E2E ${suffix}`;
    const renamedBrand = `Marque E2E ${suffix} revisee`;

    before(() => {
        cy.signInAsAdmin();
    });

    it("refuse un nom plus court que deux caractères", () => {
        cy.visit("/admin/brands/add");

        cy.formField("Nom de la marque").clear().type("A");
        cy.contains("button", "Envoyer").click();

        cy.contains("Le nom doit contenir au moins 2 caractères").should("be.visible");
    });

    it("crée la marque", () => {
        cy.visit("/admin/brands/add");

        cy.formField("Nom de la marque").clear().type(brandName);
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Marque créée avec succès.");
    });

    it("fait apparaître la marque dans la liste, filtre à l'appui", () => {
        cy.visit("/admin/brands");

        cy.get('input[placeholder="Filtrer les marques..."]').type(brandName);

        cy.tableRow(brandName).should("be.visible");
        cy.tableRow(brandName).should("contain", "Oui"); // marque active par défaut
    });

    it("affiche la fiche de la marque", () => {
        cy.visit("/admin/brands");
        cy.get('input[placeholder="Filtrer les marques..."]').type(brandName);

        cy.rowAction(brandName, "Voir");

        cy.contains("h1", "Détails de la marque").should("be.visible");
        cy.contains(`Nom: ${brandName}`).should("be.visible");
    });

    it("renomme la marque", () => {
        cy.visit("/admin/brands");
        cy.get('input[placeholder="Filtrer les marques..."]').type(brandName);

        cy.rowAction(brandName, "Modifier");

        cy.location("pathname").should("match", /^\/admin\/brands\/.+\/edit$/);
        cy.formField("Nom de la marque").clear().type(renamedBrand);
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Marque mise à jour avec succès.");

        // Le slug est recalculé à partir du nouveau nom côté API :
        // la liste doit refléter le libellé mis à jour.
        cy.visit("/admin/brands");
        cy.get('input[placeholder="Filtrer les marques..."]').type(renamedBrand);
        cy.tableRow(renamedBrand).should("be.visible");
    });

    it("supprime la marque après confirmation", () => {
        cy.visit("/admin/brands");
        cy.get('input[placeholder="Filtrer les marques..."]').type(renamedBrand);

        cy.rowAction(renamedBrand, "Supprimer");

        cy.contains("Supprimer la marque ?").should("be.visible");
        cy.contains("button", "Confirmer").click();

        cy.expectToast("Marque supprimée avec succès");

        // La page est rechargée après suppression : la marque a disparu.
        cy.visit("/admin/brands");
        cy.get('input[placeholder="Filtrer les marques..."]').type(renamedBrand);
        cy.contains("Aucun résultat.").should("be.visible");
    });

    it("laisse la marque absente de l'API après suppression", () => {
        cy.apiRequest({url: `/brands/marque-e2e-${suffix}-revisee`})
            .its("status")
            .should("eq", 404);
    });
});
