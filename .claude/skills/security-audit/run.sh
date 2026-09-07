#!/usr/bin/env bash
# Campagne de tests de sécurité contre un build de PRODUCTION.
#
# Monte un relais SMTP factice local, pointe l'application dessus, lance les
# 72 contrôles, puis inspecte le trafic SMTP brut. Aucun mail ne part vers une
# vraie boîte : le destinataire réel n'est jamais contacté.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SKILL="$ROOT/.claude/skills/security-audit"
WORK="${SINK_DIR:-$(mktemp -d -t pf-pentest)}"
PORT="${PORT:-3111}"
export SINK_DIR="$WORK"

cd "$ROOT"

# shellcheck disable=SC1090
if [ -s "$HOME/.nvm/nvm.sh" ]; then export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh" >/dev/null; nvm use >/dev/null 2>&1 || true; fi

cleanup() {
  [ -n "${SRV_PID:-}" ] && kill "$SRV_PID" 2>/dev/null || true
  [ -n "${SINK_PID:-}" ] && kill "$SINK_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "== répertoire de travail : $WORK"

if [ ! -d .output ]; then
  echo "== build de production absent, construction…"
  npm run build
fi

echo "== certificat auto-signé pour le relais factice"
openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=localhost" \
  -keyout "$WORK/key.pem" -out "$WORK/cert.pem" 2>/dev/null

echo "== démarrage du relais SMTP factice (127.0.0.1:2525)"
node "$SKILL/smtp-sink.mjs" > "$WORK/sink.log" 2>&1 &
SINK_PID=$!

echo "== démarrage de l'application sur le port $PORT"
# NODE_EXTRA_CA_CERTS fait confiance au certificat du relais SANS désactiver la
# vérification TLS de l'application : le durcissement testé reste actif.
NODE_EXTRA_CA_CERTS="$WORK/cert.pem" \
NUXT_SMTP_HOST=localhost NUXT_SMTP_PORT=2525 \
NUXT_SMTP_USER=test@example.invalid NUXT_SMTP_PASS=relais-factice \
NUXT_SMTP_TO=sink@example.invalid \
PORT="$PORT" node .output/server/index.mjs > "$WORK/server.log" 2>&1 &
SRV_PID=$!

for _ in $(seq 1 20); do
  curl -s -o /dev/null -m 2 "http://127.0.0.1:$PORT/" && break
  sleep 1
done

echo "== campagne de tests"
TARGET="http://127.0.0.1:$PORT" python3 "$SKILL/pentest.py" | tee "$WORK/report.txt"

echo
echo "== trafic SMTP réellement émis"
python3 - "$WORK/messages.log" <<'PY'
import re, sys, pathlib
raw = pathlib.Path(sys.argv[1]).read_text() if pathlib.Path(sys.argv[1]).exists() else ''
msgs = [m for m in raw.split('===== MESSAGE =====') if m.strip()]
print(f'{len(msgs)} message(s) transmis')
danger = ('bcc:', 'cc:', 'x-injected:')
found = [(i, d) for i, m in enumerate(msgs, 1) for d in danger if d in m.lower()]
print('en-têtes injectés :', found if found else 'AUCUN')
for i, m in enumerate(msgs, 1):
    head = m.strip().split('\n\n')[0]
    rt = [l for l in head.split('\n') if l.lower().startswith('reply-to:')]
    print(f'  message {i} — {rt[0] if rt else "pas de Reply-To"}')
PY

echo
echo "== rapport complet : $WORK/report.txt"
