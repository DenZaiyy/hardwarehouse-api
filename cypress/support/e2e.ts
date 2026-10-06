/// <reference types="cypress" />

import {addClerkCommands} from "@clerk/testing/cypress";
import "./commands";

// Ajoute cy.clerkSignIn / cy.clerkSignOut / cy.clerkLoaded.
// Ces commandes injectent le Testing Token récupéré par clerkSetup(), ce qui
// permet à Clerk d'accepter une session automatisée sans déclencher sa
// protection anti-bot.
addClerkCommands({Cypress, cy});

// Le rechargement déclenché après une suppression (window.location.reload)
// peut interrompre une requête en vol ; Next signale alors une erreur
// d'hydratation sans rapport avec le comportement testé. On ignore ce seul
// cas, toute autre exception non capturée doit continuer à faire échouer le test.
Cypress.on("uncaught:exception", (err) => {
    const ignored = [
        "NEXT_REDIRECT",
        "Hydration failed",
        "There was an error while hydrating",
    ];

    return !ignored.some((pattern) => err.message.includes(pattern));
});
