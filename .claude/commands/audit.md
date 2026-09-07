---
description: Chaîne de vérification complète — lint, types, CVE, build, puis les 71 contrôles de sécurité
argument-hint: "[rapide]"
---

Exécute la chaîne de vérification de ce projet, dans l'ordre, et **arrête-toi au
premier échec** en expliquant précisément ce qui casse.

Si l'argument est `rapide`, saute l'étape 6 (la campagne de sécurité, qui
construit et démarre un serveur).

```bash
nvm use
```

1. `node .claude/tools/sync-agent-docs.mjs --check` — les instructions par
   outil (`CLAUDE.md`, `GEMINI.md`, Copilot, Cursor) doivent être à jour avec
   `AGENTS.md`. Un dérivé périmé signifie que les agents non-Claude travaillent
   sur des conventions fausses. Régénérer avec la même commande sans `--check`.
2. `npm run lint`
3. `npm run typecheck`
4. `npm audit` — la référence est `found 0 vulnerabilities`. Toute
   vulnérabilité est un échec, pas un avertissement.
5. `npm run build`
6. `.claude/skills/security-audit/run.sh` — la référence est `71 PASS / 0 FAIL`.

Sur échec à l'étape 6, avant de conclure à une régression, écarte les deux faux
positifs connus (documentés dans le skill `security-audit`) :

- chemin nominal en **429** → le quota global (30 mails/h, en mémoire) est
  déjà consommé. Redémarrer le serveur remet le compteur à zéro.
- chemin nominal en **502** → `NODE_EXTRA_CA_CERTS` absent. C'est le
  durcissement TLS qui refuse le certificat auto-signé : comportement correct.

Termine par un verdict en une ligne : la chaîne passe, ou voici ce qui bloque.
N'annonce jamais un succès sans avoir vu la sortie des six étapes.
