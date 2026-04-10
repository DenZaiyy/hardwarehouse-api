module.exports = {
    apps: [
        {
            name: "hardwarehouse-next",
            script: "npm run",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
        {
            name: "hardwarehouse-cron",
            script: "scripts/sync-discounts.ts",
            interpreter: "node",
            interpreter_args: "--import tsx",  // pour exécuter le TS directement
            env: {
                NODE_ENV: "production",
            },
            // Redémarre max 5 fois si crash, puis stop
            max_restarts: 5,
            restart_delay: 5000,
            error_file: "./logs/cron-error.log",
            out_file: "./logs/cron-out.log",
        },
    ],
};