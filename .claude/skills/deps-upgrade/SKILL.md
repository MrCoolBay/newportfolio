---
name: deps-upgrade
description: Procédure de montée de version et d'hygiène des dépendances de ce projet Nuxt 4, avec les pièges spécifiques (Node LTS, npm 11, Tailwind 4, secrets figés au build). À utiliser pour toute mise à jour de dépendance, correction de CVE, ou quand npm audit remonte quelque chose.
---

# Montée de version des dépendances

Le projet est passé de **48 vulnérabilités (5 critiques) à 0**. L'objectif de
cette procédure est que ça reste vrai.

## Préalables non négociables

```bash
nvm use          # .nvmrc -> Node 22 LTS
npm --version    # doit être >= 11
```

Deux pièges déjà rencontrés ici :

- **Node impair (23, 25) ne fonctionne pas.** Nuxt 4.5 exige
  `^22.19.0 || ^24.11.0 || >=26.0.0`. Node 25 est hors plage.
- **npm 10.9.x échoue** sur `npm install` avec
  `Cannot read properties of null (reading 'edgesOut')` (bug arborist).
  `npm i -g npm@11` règle le problème.

Le hook `session-doctor` signale les deux au démarrage de session.

## Procédure

```bash
nvm use
npm outdated                       # ce qui a bougé
npm audit                          # référence : "found 0 vulnerabilities"
npm install <pkg>@<version>
npm run lint && npm run typecheck && npm run build
npm audit                          # doit toujours dire 0
.claude/skills/security-audit/run.sh   # 72 PASS / 0 FAIL
```

Le hook `audit-deps` relance automatiquement `npm audit` dès que
`package.json` change et bloque sur une high/critical.

## Vérifier l'usage avant de garder une dépendance

Le `tailwind.config.js` d'origine était **intégralement du code mort**, et deux
plugins Tailwind sur trois n'étaient jamais utilisés. Avant de monter une
dépendance, vérifie qu'elle sert :

```bash
grep -rn "<motif>" app server nuxt.config.ts
```

Supprimer bat mettre à jour.

## Pièges par écosystème

**Tailwind 4** — plus de `tailwind.config.js`, la configuration est en CSS dans
`app/assets/css/main.css`. Classes renommées en v4 :
`bg-gradient-to-*` → `bg-linear-to-*`, `flex-grow` → `grow`,
`flex-shrink-0` → `shrink-0`, `outline-none` → `outline-hidden`,
`rounded` nu → `rounded-sm`. Le preflight v4 ne met plus `cursor: pointer`
sur les `<button>`. `@apply` dans un `<style>` de SFC exigerait une directive
`@reference` : préférer les variables CSS du thème.

**Nuxt 4** — code applicatif sous `app/`, code serveur à la racine.
`compatibilityDate` change des défauts Nitro : rebuilder après l'avoir touché.

**Secrets** — ne jamais donner à `runtimeConfig.smtp.pass` une valeur par
défaut lue depuis `process.env` : elle serait figée dans `.output/`. Vérifier :

```bash
grep -rl "$(grep NUXT_SMTP_PASS .env.example | cut -d= -f2)" .output || echo "pas de fuite"
```

**Icônes** — `@nuxt/icon` tourne avec `fallbackToApi: false` et un bundle local.
Toute nouvelle famille d'icônes exige d'installer `@iconify-json/<famille>` et
de l'ajouter à `icon.serverBundle.collections` dans `nuxt.config.ts`, sinon
l'icône ne s'affichera pas (et aucune requête externe ne la sauvera).

## Second avis

Pour une montée majeure risquée, confronter plusieurs modèles :

```bash
node .claude/tools/ai-council.mjs --preset architecture \
  --prompt "Montée de <pkg> de vX à vY sur Nuxt 4. Risques ? $(npm info <pkg> --json | head -60)"
```
