import {defineConfig} from "cypress";
import {clerkSetup} from "@clerk/testing/cypress";
import {config as loadEnvFile} from "dotenv";

// Les tests réutilisent la configuration locale de l'application.
// dotenv n'écrase jamais une variable déjà définie : en CI, les variables
// injectées par le runner ont donc la priorité sur ces fichiers.
loadEnvFile({path: ".env.local", quiet: true});
loadEnvFile({path: ".env", quiet: true});

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:3000",

        // Les specs du projet sont en TypeScript. Ce motif exclut de fait
        // les exemples .cy.js livrés par défaut avec Cypress.
        specPattern: "cypress/e2e/**/*.cy.ts",
        supportFile: "cypress/support/e2e.ts",

        // Résolution desktop : la barre latérale d'administration et les
        // boutons "première / dernière page" ne sont montés qu'à partir de lg.
        viewportWidth: 1440,
        viewportHeight: 900,

        // Le serveur de développement Next compile les routes à la demande :
        // la première visite d'une page peut dépasser le délai par défaut de 4 s.
        defaultCommandTimeout: 12_000,
        pageLoadTimeout: 90_000,
        requestTimeout: 15_000,

        retries: {runMode: 2, openMode: 0},
        video: false,
        screenshotOnRunFailure: true,

        setupNodeEvents(on, config) {
            // clerkSetup récupère un Testing Token auprès de la Backend API Clerk
            // et le dépose dans config.env (CLERK_FAPI + CLERK_TESTING_TOKEN).
            // Ce jeton contourne la détection de bot, sans quoi toute tentative
            // de connexion automatisée échoue en "Bot traffic detected".
            // La clé secrète reste côté Node : elle n'est jamais publiée dans config.env.
            return clerkSetup({
                config,
                options: {
                    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
                },
            });
        },
    },

    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
    },
});
