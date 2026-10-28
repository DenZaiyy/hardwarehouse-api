// PM2 en production : l'API tourne depuis le lien current, que chaque déploiement fait pointer sur une nouvelle
// version (deploy/receive-release.sh). Démarrage initial et migration depuis l'ancien dossier : deploy/README.md.
module.exports = {
    apps: [
        {
            name: "next-api",
            cwd: `${process.env.HOME}/hardwarehouse-api/current`,
            script: "server.js",
            // Une seule instance (la valeur par défaut) : la limitation de débit garde ses compteurs en mémoire
            // (lib/rate-limit.ts). Plusieurs instances exigeraient un stockage partagé, comme Redis sur le VPS.
            instances: 1,
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                // IPv4 et IPv6 sur toutes les interfaces, comme next start : les services appellent localhost, qui
                // se résout d'abord en ::1, et avec 127.0.0.1 seul le middleware de Clerk relaie chaque requête vers
                // localhost sans qu'elle aboutisse. Le pare-feu d'OVH ne laisse passer que 22, 80 et 443.
                HOSTNAME: "::",
            },
        },
    ],
};
