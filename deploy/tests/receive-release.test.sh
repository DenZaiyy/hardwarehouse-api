#!/usr/bin/env bash
# Tests de deploy/receive-release.sh, sur de vraies versions minimales (un serveur Node qui répond son étiquette)
# et un vrai PM2, isolé dans un dossier temporaire : le PM2 de la machine n'est jamais touché.
# Usage : bash deploy/tests/receive-release.test.sh (prérequis : node, pm2, curl, tar)
set -uo pipefail

SCRIPT="${RECEIVE_RELEASE_SCRIPT:-$(cd "$(dirname "$0")/.." && pwd)/receive-release.sh}"
TMP=$(mktemp -d "${TMPDIR:-/tmp}/receive-release.XXXXXX")

export PM2_HOME="$TMP/pm2"
export APP_DIR="$TMP/app"
export PM2_APP="test-next-api"
export APP_PORT=3290
export SMOKE_PORT=3291
export HEALTH_PATH=/health
export HEALTH_TIMEOUT=10
export KEEP_RELEASES=3
export MIN_FREE_MB=1
export LOCK_WAIT=2

cleanup() {
    pm2 kill >/dev/null 2>&1
    rm -rf "$TMP"
}
trap cleanup EXIT

failures=0
check() {
    local name=$1
    shift
    if "$@"; then
        printf '  ok     %s\n' "$name"
    else
        printf '  ÉCHEC  %s\n' "$name"
        sed 's/^/         | /' "$TMP/out.log" 2>/dev/null | tail -n 15
        failures=$((failures + 1))
    fi
}

# make_release <étiquette> [normal|crash|crash-on-app-port|no-server] : archive d'une version
make_release() {
    local label=$1 mode=${2:-normal} dir="$TMP/fixtures/$1"
    mkdir -p "$dir/.next/static" "$dir/public"
    if [[ "$mode" != no-server ]]; then
        cat > "$dir/server.js" <<JS
const http = require("node:http");
const port = Number(process.env.PORT);
if ("$mode" === "crash" || ("$mode" === "crash-on-app-port" && port === $APP_PORT)) process.exit(1);
http.createServer((req, res) => {
    res.writeHead(req.url === "$HEALTH_PATH" ? 200 : 404);
    res.end("$label");
}).listen(port, process.env.HOSTNAME || "127.0.0.1");
JS
    fi
    tar -czf "$TMP/fixtures/$label.tar.gz" -C "$dir" .
    echo "$TMP/fixtures/$label.tar.gz"
}

# run_script <commande> [archive] : appelle le script comme le fait la clé SSH de la CI
run_script() {
    local command=$1 archive=${2:-/dev/null}
    SSH_ORIGINAL_COMMAND="$command" bash "$SCRIPT" < "$archive" > "$TMP/out.log" 2>&1
}

served() { curl -fsS --max-time 3 "http://127.0.0.1:$APP_PORT$HEALTH_PATH" 2>/dev/null; }
# Nombre de redémarrages de l'application par PM2 : un échec avant la bascule ne doit pas en ajouter
restarts() {
    pm2 jlist 2>/dev/null | node -e '
        let input = "";
        process.stdin.on("data", (chunk) => (input += chunk));
        process.stdin.on("end", () => {
            const app = JSON.parse(input).find((candidate) => candidate.name === process.argv[1]);
            process.stdout.write(app ? String(app.pm2_env.restart_time) : "");
        });
    ' "$PM2_APP"
}
current_release() { basename "$(readlink "$APP_DIR/current")"; }
release_count() { find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 ! -name '.*' | wc -l | tr -d ' '; }

# exits_with <code> <commande...> : le script doit finir avec ce code (1 échec, 2 commande refusée, 3 PM2 ne sert pas current)
exits_with() {
    local expected=$1
    shift
    "$@"
    [[ $? -eq $expected ]]
}
# Une valeur vide signale un fichier ou un lien absent : elle ne doit jamais rendre un test vert
equals() { [[ -n "$1" && "$1" == "$2" ]]; }
no_release_dir() { [[ ! -d "$APP_DIR/releases" ]] || [[ "$(release_count)" == 0 ]]; }

mkdir -p "$APP_DIR/shared" "$TMP/fixtures"
echo "DATABASE_URL=test" > "$APP_DIR/shared/.env.local"

echo "receive-release.sh"

check "refuse une commande inconnue" exits_with 2 run_script "rm -rf $APP_DIR"
check "n'a rien créé pour une commande refusée" no_release_dir

# Sans dossier d'application, le verrou ne peut pas être créé : échec immédiat, pas l'attente d'un autre déploiement
finishes_quickly() {
    local started=$SECONDS
    "$@"
    ((SECONDS - started < 10))
}
check "échoue tout de suite sans dossier d'application" finishes_quickly exits_with 1 env APP_DIR="$TMP/absent" LOCK_WAIT=60 SSH_ORIGINAL_COMMAND=rollback bash "$SCRIPT"

check "refuse un identifiant de version invalide" exits_with 2 run_script "deploy ../../etc" "$(make_release bad-id)"
check "refuse une archive sans server.js" exits_with 1 run_script "deploy 0000000" "$(make_release empty no-server)"
check "ne garde rien d'une archive refusée" no_release_dir

# Première version : le lien current est posé, mais PM2 ne sert pas encore depuis ce dossier
check "signale que PM2 ne sert pas encore la première version" exits_with 3 run_script "deploy aaaaaaa1" "$(make_release A)"
check "active la première version dans current" equals "$(current_release)" "$(basename "$(find "$APP_DIR/releases" -maxdepth 1 -name '*-aaaaaaa1')")"
check "relie le .env.local partagé" equals "$(readlink "$APP_DIR/current/.env.local")" "$APP_DIR/shared/.env.local"
check "relie le dossier d'images partagé" equals "$(readlink "$APP_DIR/current/public/images")" "$APP_DIR/shared/images"

# Avant la migration, PM2 lance encore l'ancienne installation sous le même nom : le script ne doit pas la recharger
mkdir -p "$TMP/legacy"
tar -xzf "$(make_release OLD)" -C "$TMP/legacy"
(cd "$TMP/legacy" && PORT=$APP_PORT HOSTNAME=127.0.0.1 pm2 start server.js --name "$PM2_APP" > /dev/null 2>&1)
sleep 1
legacy_restarts=$(restarts)
check "refuse de recharger un PM2 qui lance l'ancienne installation" exits_with 3 run_script "deploy aaaaaaa2" "$TMP/fixtures/A.tar.gz"
check "laisse l'ancienne installation en service" equals "$(served)" "OLD"
check "ne redémarre pas l'ancienne installation" equals "$(restarts)" "$legacy_restarts"
pm2 delete "$PM2_APP" > /dev/null 2>&1

# Migration faite à la main dans la procédure : PM2 lance l'API depuis current
cat > "$TMP/ecosystem.json" <<JSON
{"apps": [{"name": "$PM2_APP", "cwd": "$APP_DIR/current", "script": "server.js",
           "env": {"PORT": "$APP_PORT", "HOSTNAME": "::"}}]}
JSON
pm2 start "$TMP/ecosystem.json" > /dev/null 2>&1
sleep 1
check "PM2 sert la première version après la migration" equals "$(served)" "A"

check "met en service une version valide" run_script "deploy bbbbbbb2" "$(make_release B)"
check "sert la nouvelle version" equals "$(served)" "B"

restarts_before=$(restarts)
check "refuse une version qui ne démarre pas" exits_with 1 run_script "deploy ccccccc3" "$(make_release C crash)"
check "garde la version en service quand le test préalable échoue" equals "$(served)" "B"
check "ne redémarre pas la version en service quand le test préalable échoue" equals "$(restarts)" "$restarts_before"
check "supprime la version refusée" equals "$(find "$APP_DIR/releases" -maxdepth 1 -name '*-ccccccc3' | wc -l | tr -d ' ')" 0

# Un serveur resté sur le port de test ne doit pas valider une version cassée à sa place
PORT=$SMOKE_PORT node "$TMP/fixtures/B/server.js" > /dev/null 2>&1 &
squatter=$!
sleep 1
check "refuse de tester une version sur un port de test occupé" exits_with 1 run_script "deploy cccccc33" "$TMP/fixtures/C.tar.gz"
check "ne bascule pas quand le port de test est occupé" equals "$(restarts)" "$restarts_before"
kill "$squatter"
wait "$squatter" 2>/dev/null

check "signale l'échec d'une version cassée après la bascule" exits_with 1 run_script "deploy ddddddd4" "$(make_release D crash-on-app-port)"
check "revient à la version précédente" equals "$(served)" "B"
check "repointe current sur la version précédente" equals "$(current_release)" "$(basename "$(find "$APP_DIR/releases" -maxdepth 1 -name '*-bbbbbbb2')")"

count_before=$(release_count)
MIN_FREE_MB=999999999
check "refuse de déployer quand le disque manque de place" exits_with 1 run_script "deploy eeeeeee5" "$(make_release E)"
MIN_FREE_MB=1
check "n'extrait rien sans place disque" equals "$(release_count)" "$count_before"

mkdir "$APP_DIR/.deploy.lock"
sleep 30 &
holder=$!
echo "$holder" > "$APP_DIR/.deploy.lock/pid"
check "refuse de déployer pendant un autre déploiement" exits_with 1 run_script "deploy eeeeeee5" "$TMP/fixtures/E.tar.gz"
check "laisse la version en service pendant un autre déploiement" equals "$(served)" "B"
kill "$holder"
wait "$holder" 2>/dev/null

check "reprend le verrou d'un déploiement interrompu" run_script "deploy eeeeeee5" "$TMP/fixtures/E.tar.gz"
check "sert la version déployée après reprise du verrou" equals "$(served)" "E"

run_script "deploy fffffff6" "$(make_release F)"
check "met en service une autre version" run_script "deploy abcdef07" "$(make_release G)"
check "ne garde que les trois dernières versions" equals "$(find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 ! -name '.*' -exec basename {} \; | sed 's/^.*-//' | sort | tr '\n' ' ')" "abcdef07 eeeeeee5 fffffff6 "

check "revient à la version précédente sur demande" run_script "rollback"
check "sert la version précédente après le retour arrière" equals "$(served)" "F"

echo
if ((failures > 0)); then
    echo "$failures échec(s)"
    exit 1
fi
echo "Tous les tests passent"
