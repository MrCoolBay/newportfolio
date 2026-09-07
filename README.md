# Portfolio — fabienlubin.fr

Portfolio personnel construit avec **Nuxt 4**, **Vue 3** et **Tailwind CSS 4**.

## Prérequis

Node **24.11+** — la version servie par Vercel en production. Un `.nvmrc` est
fourni :

```bash
nvm use
```

> Node 23 et 25 (versions impaires, non LTS) ne sont pas supportés. Node 22
> fonctionne avec Nuxt mais n'est plus la cible de ce projet : dev et prod
> tiennent le même runtime.

## Installation

```bash
nvm use
npm install
cp .env.example .env   # puis renseigner NUXT_SMTP_PASS
```

## Scripts

| Commande            | Rôle                                              |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Serveur de développement sur `http://localhost:3000` |
| `npm run build`     | Build de production dans `.output/`               |
| `npm run preview`   | Prévisualisation du build de production           |
| `npm run generate`  | Génération statique                               |
| `npm run lint`      | ESLint (config Nuxt)                              |
| `npm run lint:fix`  | ESLint avec correction automatique                |
| `npm run typecheck` | Vérification des types (`vue-tsc`)                |
| `npm run audit`     | Audit des dépendances (échoue dès `moderate`)     |

Lancer le build de production :

```bash
npm run build
node .output/server/index.mjs
```

## Structure

Arborescence Nuxt 4 : le code applicatif vit sous `app/`, le code serveur reste
à la racine.

```
app/
  app.vue            racine de l'application
  error.vue          page d'erreur (404/500/…)
  assets/css/        point d'entrée Tailwind
  components/        composants auto-importés
  layouts/           layouts
  pages/             routes basées sur les fichiers
server/
  api/               endpoints Nitro
  plugins/           plugins Nitro
  utils/             utilitaires serveur auto-importés
public/              fichiers servis tels quels
```

## Variables d'environnement

Voir `.env.example`. Toutes les clés `NUXT_SMTP_*` sont **serveur uniquement**
et n'apparaissent jamais dans le bundle client.

| Variable               | Rôle                                     |
| ---------------------- | ---------------------------------------- |
| `NUXT_PUBLIC_SITE_URL` | URL canonique (sitemap, robots, meta OG) |
| `NUXT_SMTP_HOST`       | Hôte SMTP                                |
| `NUXT_SMTP_PORT`       | Port SMTP (587 STARTTLS, 465 TLS direct) |
| `NUXT_SMTP_USER`       | Compte SMTP authentifié                  |
| `NUXT_SMTP_PASS`       | Mot de passe SMTP (**secret**)           |
| `NUXT_SMTP_TO`         | Destinataire du formulaire de contact    |

L'ancien nom `SMTP_PASS` reste accepté en secours pour ne pas casser un
déploiement existant, mais `NUXT_SMTP_PASS` doit être préféré.

## Sécurité

Les protections en place sont documentées dans `SECURITY.md`.

## Agents de code

`AGENTS.md` est la source de vérité des conventions du projet, tous outils
confondus. `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` et
`.cursor/rules/project.mdc` en sont **générés** — ne pas les éditer :

```bash
node .claude/tools/sync-agent-docs.mjs           # régénère
node .claude/tools/sync-agent-docs.mjs --check   # échoue si périmé
```

Revue croisée multi-modèles (Claude, Gemini, GPT, Grok, OpenRouter, Ollama) :

```bash
node .claude/tools/ai-council.mjs --status
```
