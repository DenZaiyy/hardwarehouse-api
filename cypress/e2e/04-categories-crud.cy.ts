/**
 * Cycle de vie d'une catégorie.
 *
 * Même logique que pour les marques, sur l'entité qui porte en plus les
 * attributs typés des produits. Le parcours reste enchaîné et se nettoie
 * lui-même par sa dernière étape.
 */
describe("Gestion des catégories", {testIsolation: false}, () => {
    const suffix = Date.now();
    const categoryName = `Categorie E2E ${suffix}`;
    const renamedCategory = `Categorie E2E ${suffix} revisee`;
    const searchInput = 'input[placeholder="Filtrer les catégories..."]';

    before(() => {
        cy.signInAsAdmin();
    });

    it("refuse un nom plus court que deux caractères", () => {
        cy.visit("/admin/categories/add");

        cy.formField("Nom de la catégorie").clear().type("A");
        cy.contains("button", "Envoyer").click();

        cy.contains("Le nom doit contenir au moins 2 caractères").should("be.visible");
    });

    it("crée la catégorie", () => {
        cy.visit("/admin/categories/add");

        cy.formField("Nom de la catégorie").clear().type(categoryName);
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Catégorie créée avec succès.");
    });

    it("fait apparaître la catégorie dans la liste", () => {
        cy.visit("/admin/categories");

        cy.get(searchInput).type(categoryName);

        cy.tableRow(categoryName).should("be.visible");
    });

    it("renomme la catégorie", () => {
        cy.visit("/admin/categories");
        cy.get(searchInput).type(categoryName);

        cy.rowAction(categoryName, "Modifier");

        cy.formField("Nom de la catégorie").clear().type(renamedCategory);
        cy.contains("button", "Envoyer").click();

        cy.expectToast("Catégorie mise à jour avec succès.");

        cy.visit("/admin/categories");
        cy.get(searchInput).type(renamedCategory);
        cy.tableRow(renamedCategory).should("be.visible");
    });

    it("supprime la catégorie après confirmation", () => {
        cy.visit("/admin/categories");
        cy.get(searchInput).type(renamedCategory);

        cy.rowAction(renamedCategory, "Supprimer");

        cy.get('[role="alertdialog"]').should("be.visible");
        cy.get('[role="alertdialog"]').contains("button", "Confirmer").click();

        cy.expectToast("Catégorie supprimée avec succès");

        cy.visit("/admin/categories");
        cy.get(searchInput).type(renamedCategory);
        cy.contains("Aucun résultat.").should("be.visible");
    });
});
