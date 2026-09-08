<div align="center">

# fabienlubin.fr

**Portfolio et vitrine freelance de Fabien Lubin** — développeur full-stack

[![Nuxt](https://img.shields.io/badge/Nuxt-4.5-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node](https://img.shields.io/badge/Node-24_LTS-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-b45309)](LICENSE)

[![npm audit](https://img.shields.io/badge/npm_audit-0_vuln%C3%A9rabilit%C3%A9-16a34a)](#sécurité)
[![Contrôles sécurité](https://img.shields.io/badge/contr%C3%B4les_s%C3%A9curit%C3%A9-72%2F72-16a34a)](#sécurité)

[Site en ligne](https://www.fabienlubin.fr) · [Parcours](https://www.fabienlubin.fr/about) · [Projets](https://www.fabienlubin.fr/projects)

</div>

---

## À propos

Site à double usage : **CV** en ligne et **vitrine** d'une activité freelance
(sites vitrines, applications web et mobiles, API). Rendu côté serveur, endpoint
de contact durci, et une campagne de tests de sécurité rejouable en une commande.

Ce dépôt sert aussi de terrain d'essai : la posture de sécurité y est traitée
comme une fonctionnalité, pas comme une case à cocher.

## Stack

| Domaine | Choix | Pourquoi |
| --- | --- | --- |
| Framework | Nuxt 4 · Vue 3 | Rendu serveur et API dans un seul projet |
| Styles | Tailwind CSS 4 | Configuration en CSS, jetons de charte centralisés |
| Serveur | Nitro · H3 | Routes typées, cache et règles d'en-têtes natifs |
| Validation | Zod 4 | Schémas stricts sur les entrées utilisateur |
| Mail | Nodemailer 10 | SMTP avec STARTTLS obligatoire |
| Icônes | `@nuxt/icon` | Bundle **local**, aucune requête tierce |
| Qualité | ESLint 10 · `vue-tsc` | Lint et types vérifiés à chaque édition |

## Démarrage

```bash
nvm use              # Node 24 LTS via .nvmrc
npm install
cp .env.example .env # puis renseigner NUXT_SMTP_PASS
npm run dev          # http://localhost:3000
```

> [!IMPORTANT]
> **Node 24 et npm ≥ 11 sont requis.** Les versions impaires de Node (23, 25) ne
> sont pas LTS et ne sont pas supportées. npm 10.9.x échoue sur `npm install`
> avec `Cannot read properties of null (reading 'edgesOut')`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `.output/` |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` · `npm run lint:fix` | ESLint |
| `npm run typecheck` | Vérification des types |
| `npm audit` | Référence attendue : `found 0 vulnerabilities` |
| `.claude/skills/security-audit/run.sh` | 72 contrôles de sécurité |
| `node .claude/tools/sync-agent-docs.mjs` | Régénère les instructions par outil |

## Structure

Arborescence Nuxt 4 : le code applicatif vit sous `app/`, le code serveur reste à
la racine.

```
app/
  app.vue  error.vue         racine et page d'erreur
  assets/css/main.css        entrée Tailwind + jetons de charte
  components/                auto-importés
  layouts/  pages/           layouts et routes basées sur les fichiers
server/
  api/                       endpoints Nitro (contact, résumé GitHub)
  plugins/  utils/           plugins et utilitaires serveur
public/                      servi tel quel
.claude/                     outillage agentique (hooks, skills, agents)
```

> [!WARNING]
> Un dossier `pages/` ou `components/` placé **à la racine** est silencieusement
> ignoré par Nuxt 4 — aucune erreur, la route n'existe simplement pas.

## Sécurité

La posture complète et les risques résiduels assumés sont documentés dans
[`SECURITY.md`](SECURITY.md). En résumé :

- **En-têtes** — CSP, HSTS, COOP/CORP, `Permissions-Policy`, `X-Frame-Options`,
  `no-store` et `noindex` sur `/api/**`.
- **`POST /api/contact`** — contrôles ordonnés : type de contenu, taille du corps
  vérifiée *avant* lecture, origine, limitation de débit, puis validation Zod
  stricte. Rejet de `CR`/`LF`/`NUL` sur tout champ atteignant un en-tête SMTP.
- **Secrets** — aucune valeur par défaut lue depuis `process.env` dans
  `runtimeConfig` : elle serait figée dans le build.
- **Aucune ressource tierce** — icônes bundlées localement, résumé GitHub servi
  par notre propre API. Le navigateur ne parle qu'à notre origine.

```bash
.claude/skills/security-audit/run.sh   # attendu : 72 PASS / 0 FAIL
```

Le harness monte un relais SMTP factice : **aucun mail ne part vers une vraie
adresse**. Il refuse de rendre un verdict si la cible n'est pas cette application
(`exit 2`) ou si un pare-feu d'hébergeur s'interpose (`exit 3`).

## Agents de code

[`AGENTS.md`](AGENTS.md) est la **source de vérité** des conventions, tous outils
confondus. `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` et
`.cursor/rules/project.mdc` en sont **générés** — ne pas les éditer :

```bash
node .claude/tools/sync-agent-docs.mjs           # régénère
node .claude/tools/sync-agent-docs.mjs --check    # échoue si périmé
```

Le dépôt embarque aussi des hooks (protection des secrets, lint ciblé, audit des
dépendances, politique de commit) et une revue croisée multi-modèles :

```bash
node .claude/tools/ai-council.mjs --status
```

## Déploiement

Hébergé sur Vercel, déploiement automatique sur `main`. Variables requises :

| Variable | Rôle |
| --- | --- |
| `NUXT_PUBLIC_SITE_URL` | URL canonique (sitemap, robots, Open Graph) |
| `NUXT_SMTP_HOST` · `NUXT_SMTP_PORT` | Relais SMTP (587 STARTTLS, 465 TLS direct) |
| `NUXT_SMTP_USER` · `NUXT_SMTP_PASS` | Compte SMTP authentifié |
| `NUXT_SMTP_TO` | Destinataire du formulaire de contact |

## Licence

Le code est publié sous [licence MIT](LICENSE).

[`NOTICE`](NOTICE) précise la portée : les **contenus personnels** (parcours,
textes de présentation) et les **visuels de tiers** (logo et photographies du bar
L'Univers) ne sont pas couverts. Reprenez l'architecture, remplacez les contenus.
