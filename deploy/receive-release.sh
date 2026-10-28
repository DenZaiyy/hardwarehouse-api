#!/usr/bin/env bash
# Reçoit une version de l'API construite par CircleCI et la met en service sur le VPS (voir deploy/README.md).
#
# La clé SSH de la CI ne peut lancer que ce script (option command= de authorized_keys) :
#   ssh hwh@vps "deploy <commit>" < release.tar.gz   extrait, teste, bascule current, recharge PM2
#   ssh hwh@vps "rollback"                           remet en service la version précédente
# L'archive contient la sortie standalone de Next.js : le serveur ne compile ni n'installe rien.
#
# Codes de sortie : 0 en service, 1 déploiement en échec (la version en service est conservée), 2 commande refusée,
# 3 version prête dans current mais PM2 ne la sert pas (migration à terminer, deploy/README.md).
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/hardwarehouse-api}"
PM2_APP="${PM2_APP:-next-api}"
APP_PORT="${APP_PORT:-3000}"
SMOKE_PORT="${SMOKE_PORT:-3100}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
MIN_FREE_MB="${MIN_FREE_MB:-2048}"
LOCK_WAIT="${LOCK_WAIT:-300}"

RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"
LOCK_DIR="$APP_DIR/.deploy.lock"

LOCKED=0
INCOMING=""
SMOKE_PID=""

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

die() {
    local code=$1
    shift
    printf '[%s] ERREUR : %s\n' "$(date -u +%H:%M:%S)" "$*" >&2
    exit "$code"
}

cleanup() {
    if [[ -n "$SMOKE_PID" ]]; then kill "$SMOKE_PID" 2> /dev/null || true; fi
    if [[ -n "$INCOMING" ]]; then rm -rf "$INCOMING"; fi
    if ((LOCKED == 1)); then rm -rf "$LOCK_DIR"; fi
}
trap cleanup EXIT

# La commande forcée tourne sans shell de connexion : charge le Node de nvm, celui qui fait tourner PM2
load_node() {
    local nvm_sh="${NVM_DIR:-$HOME/.nvm}/nvm.sh" tool
    if ! command -v pm2 > /dev/null 2>&1 && [[ -s "$nvm_sh" ]]; then
        set +eu
        # shellcheck source=/dev/null
        . "$nvm_sh"
        set -eu
    fi
    for tool in node pm2 curl; do
        command -v "$tool" > /dev/null || die 1 "$tool introuvable"
    done
}

# Un seul déploiement à la fois ; un verrou laissé par un processus disparu est repris
acquire_lock() {
    local waited=0 holder
    until mkdir "$LOCK_DIR" 2> /dev/null; do
        [[ -d "$LOCK_DIR" ]] || die 1 "Impossible de créer le verrou $LOCK_DIR : le dossier $APP_DIR existe-t-il ?"
        holder=$(cat "$LOCK_DIR/pid" 2> /dev/null || true)
        if [[ -n "$holder" ]] && ! kill -0 "$holder" 2> /dev/null; then
            log "Verrou laissé par le processus $holder, qui n'existe plus : repris"
            rm -rf "$LOCK_DIR"
            continue
        fi
        ((waited < LOCK_WAIT)) || die 1 "Un autre déploiement est en cours (verrou $LOCK_DIR)"
        sleep 1
        waited=$((waited + 1))
    done
    LOCKED=1
    echo $$ > "$LOCK_DIR/pid"
}

check_disk() {
    local free_mb
    free_mb=$(df -Pk "$APP_DIR" | awk 'NR == 2 { print int($4 / 1024) }')
    ((free_mb >= MIN_FREE_MB)) || die 1 "Espace disque insuffisant : $free_mb Mo libres, $MIN_FREE_MB Mo exigés"
}

# <date UTC>-<commit> : deux versions ne partagent jamais la même seconde, l'ordre des noms est celui des déploiements
new_release_name() {
    local id=$1 stamp
    stamp=$(date -u +%Y%m%d%H%M%S)
    while [[ -n "$(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -name "$stamp-*" -print -quit)" ]]; do
        sleep 1
        stamp=$(date -u +%Y%m%d%H%M%S)
    done
    echo "$stamp-${id:0:12}"
}

receive_archive() {
    local release=$1
    INCOMING="$RELEASES_DIR/.incoming-$(basename "$release")"
    mkdir -p "$INCOMING"
    tar -xzf - -C "$INCOMING" || die 1 "Archive illisible"
    [[ -f "$INCOMING/server.js" ]] || die 1 "Archive invalide : server.js absent"
    mv "$INCOMING" "$release"
    INCOMING=""
}

# Les secrets et les images envoyées depuis le back-office survivent aux versions
link_shared() {
    local release=$1
    ln -s "$SHARED_DIR/.env.local" "$release/.env.local"
    mkdir -p "$SHARED_DIR/images" "$release/public"
    rm -rf "$release/public/images"
    ln -s "$SHARED_DIR/images" "$release/public/images"
}

# curl renvoie 7 quand rien n'écoute : tout autre résultat signale un port occupé
port_free() {
    local status=0
    curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$1/" || status=$?
    ((status == 7))
}

wait_healthy() {
    local port=$1 pid=${2:-} deadline=$((SECONDS + HEALTH_TIMEOUT))
    while ((SECONDS < deadline)); do
        if curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:$port$HEALTH_PATH" 2> /dev/null; then
            return 0
        fi
        if [[ -n "$pid" ]] && ! kill -0 "$pid" 2> /dev/null; then
            return 1
        fi
        sleep 1
    done
    return 1
}

# La nouvelle version démarre à côté de celle en service, qui n'est touchée que si ce test passe
smoke_test() {
    local release=$1 healthy=0
    port_free "$SMOKE_PORT" || die 1 "Le port de test $SMOKE_PORT est déjà occupé"
    # Même adresse d'écoute que l'application dans PM2 (ecosystem.config.js)
    (cd "$release" && PORT="$SMOKE_PORT" HOSTNAME=:: exec node server.js) > "$release/.smoke.log" 2>&1 &
    SMOKE_PID=$!
    wait_healthy "$SMOKE_PORT" "$SMOKE_PID" && healthy=1
    kill "$SMOKE_PID" 2> /dev/null || true
    wait "$SMOKE_PID" 2> /dev/null || true
    SMOKE_PID=""
    if ((healthy == 0)); then
        tail -n 20 "$release/.smoke.log" >&2
        rm -rf "$release"
        die 1 "La version ne répond pas sur le port de test $SMOKE_PORT : rien n'a été basculé"
    fi
}

switch_to() { ln -sfn "releases/$1" "$CURRENT_LINK"; }

# Chemin du lien avec ses dossiers parents résolus, pour comparer sans suivre le lien lui-même
link_path() {
    local parent
    parent=$(cd -P "$(dirname "$1")" 2> /dev/null && pwd) || return 0
    echo "$parent/$(basename "$1")"
}

# Dossier de lancement de l'application dans PM2 (vide si elle n'existe pas). PM2 peut écrire des avis
# (« [PM2] Spawning PM2 daemon… ») avant la liste JSON : seule la dernière ligne qui se lit en JSON compte.
pm2_cwd() {
    pm2 jlist 2> /dev/null | node -e '
        let input = "";
        process.stdin.on("data", (chunk) => (input += chunk));
        process.stdin.on("end", () => {
            let apps = [];
            for (const line of input.split("\n").reverse()) {
                try {
                    apps = JSON.parse(line);
                    break;
                } catch {}
            }
            const app = Array.isArray(apps) ? apps.find((candidate) => candidate.name === process.argv[1]) : null;
            process.stdout.write(app ? app.pm2_env.pm_cwd : "");
        });
    ' "$PM2_APP"
}

# PM2 doit lancer l'API depuis le lien current, sinon recharger ne servirait pas la version basculée
ensure_pm2_serves_current() {
    local served_from
    served_from=$(pm2_cwd)
    if [[ -z "$served_from" || "$(link_path "$served_from")" != "$(link_path "$CURRENT_LINK")" ]]; then
        die 3 "La version est dans $CURRENT_LINK, mais PM2 ne la sert pas (processus $PM2_APP ${served_from:-absent}) : termine la migration décrite dans deploy/README.md"
    fi
}

reload_and_check() {
    pm2 reload "$PM2_APP" > /dev/null || return 1
    wait_healthy "$APP_PORT"
}

prune() {
    local current_name old
    current_name=$(basename "$(readlink "$CURRENT_LINK")")
    find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -exec basename {} \; | sort -r \
        | tail -n +$((KEEP_RELEASES + 1)) | while read -r old; do
            [[ "$old" == "$current_name" ]] && continue
            rm -rf "${RELEASES_DIR:?}/$old"
            log "Ancienne version supprimée : $old"
        done
}

deploy() {
    local id=$1 name release previous
    [[ -f "$SHARED_DIR/.env.local" ]] || die 1 "Fichier absent : $SHARED_DIR/.env.local (voir deploy/README.md)"
    load_node
    acquire_lock
    check_disk
    mkdir -p "$RELEASES_DIR"

    name=$(new_release_name "$id")
    release="$RELEASES_DIR/$name"
    log "Réception de la version $name"
    receive_archive "$release"
    link_shared "$release"

    log "Test de la version sur le port $SMOKE_PORT"
    smoke_test "$release"

    previous=$(readlink "$CURRENT_LINK" 2> /dev/null || true)
    switch_to "$name"
    log "current pointe sur $name"
    ensure_pm2_serves_current

    log "Rechargement de PM2"
    if ! reload_and_check; then
        [[ -n "$previous" ]] || die 1 "La version $name ne répond pas sur le port $APP_PORT, et aucune version précédente n'existe"
        log "La version $name ne répond pas sur le port $APP_PORT : retour à $(basename "$previous")"
        ln -sfn "$previous" "$CURRENT_LINK"
        rm -rf "$release"
        reload_and_check || die 1 "$(basename "$previous") ne répond pas non plus : intervention nécessaire (pm2 logs $PM2_APP)"
        die 1 "Version $name refusée après la bascule, $(basename "$previous") remise en service"
    fi

    prune
    log "Version $name en service"
}

rollback() {
    local current_name previous
    load_node
    acquire_lock
    [[ -L "$CURRENT_LINK" ]] || die 1 "Aucune version en service ($CURRENT_LINK absent)"
    current_name=$(basename "$(readlink "$CURRENT_LINK")")
    previous=$(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -exec basename {} \; | sort \
        | awk -v current="$current_name" '$0 < current' | tail -n 1)
    [[ -n "$previous" ]] || die 1 "Aucune version antérieure à « $current_name »"
    switch_to "$previous"
    log "current pointe sur $previous"
    ensure_pm2_serves_current
    reload_and_check || die 1 "La version $previous ne répond pas sur le port $APP_PORT (pm2 logs $PM2_APP)"
    log "Version $previous remise en service"
}

main() {
    local command="${SSH_ORIGINAL_COMMAND:-$*}" action="" argument="" extra=""
    read -r action argument extra <<< "$command" || true
    case "$action" in
        deploy)
            [[ -z "$extra" && "$argument" =~ ^[0-9a-f]{7,40}$ ]] || die 2 "Identifiant de version invalide : « $argument »"
            deploy "$argument"
            ;;
        rollback)
            [[ -z "$argument" ]] || die 2 "rollback ne prend pas d'argument"
            rollback
            ;;
        *)
            die 2 "Commande refusée : « $command » (deploy <commit> ou rollback)"
            ;;
    esac
}

main "$@"
