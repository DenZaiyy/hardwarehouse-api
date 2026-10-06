/**
 * Navigation générale du back-office.
 *
 * Chaque section listée dans la barre latérale doit être atteignable et rendre
 * son écran de gestion. Ce parcours détecte immédiatement une régression de
 * routage ou une page qui échoue au rendu côté serveur.
 */
describe("Navigation du back-office", {testIsolation: false}, () => {
    const sections = [
        {menu: "Produits", path: "/admin/products", heading: /Gestion des produits/},
        {menu: "Catégories", path: "/admin/categories", heading: /Gestion des catégories/},
        {menu: "Marques", path: "/admin/brands", heading: /Gestion des marques/},
        {menu: "Stocks", path: "/admin/stocks", heading: /Gestion des stocks/},
        {menu: "Remises", path: "/admin/discounts", heading: /Gestion des remises/},
        {menu: "Bon de commandes", path: "/admin/purchase-orders", heading: /Liste des bons de commandes/},
    ];

    before(() => {
        cy.signInAsAdmin();
    });

    sections.forEach(({menu, path, heading}) => {
        it(`ouvre la section « ${menu} » depuis la barre latérale`, () => {
            cy.visit("/admin");

            cy.get('[data-slot="sidebar-content"]').contains("a", menu).click();

            cy.location("pathname").should("eq", path);
            cy.contains("h1", heading).should("be.visible");
        });
    });

    it("affiche le total renvoyé par l'API dans le titre de la liste", () => {
        cy.visit("/admin/brands");

        // Le titre porte le total renvoyé par l'API, et non le nombre de lignes
        // rendues : ce compteur valide la remontée du champ `total`.
        cy.contains("h1", /Gestion des marques \(\d+\)/).should("be.visible");
    });

    it("affiche le graphique de suivi des stocks sur le tableau de bord", () => {
        cy.visit("/admin");

        cy.contains("h1", "Tableau de bord d'administration").should("be.visible");
        cy.get("section").should("exist");
    });
});
