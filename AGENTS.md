# Portfolio fabienlubin.fr — instructions pour agents

> **Ce fichier est la source de vérité, tous outils confondus.**
> `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` et
> `.cursor/rules/project.mdc` sont **générés** depuis celui-ci — ne pas les
> éditer à la main. Après avoir modifié ce fichier :
> `node .claude/tools/sync-agent-docs.mjs`

Portfolio Nuxt 4 / Vue 3 / Tailwind 4. Site vitrine : pas d'authentification,
pas de base de données. La seule surface d'écriture est `POST /api/contact`.

## Avant toute commande

```bash
nvm use    # Node 22 LTS via .nvmrc
```

Deux pièges d'environnement, tous deux déjà rencontrés sur cette machine :

- **Node impair (23, 25) ne marche pas.** Nuxt 4.5 exige
  `^22.19.0 || ^24.11.0 || >=26.0.0`. Le Node par défaut de cette machine
  (25.x) est hors plage.
- **npm 10.9.x échoue** sur `npm install` (`Cannot read properties of null
  (reading 'edgesOut')`, bug arborist). npm >= 11 requis.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de dev |
| `npm run build` | build de production dans `.output/` |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run typecheck` | `vue-tsc` |
| `npm audit` | référence : **`found 0 vulnerabilities`** |
| `.claude/skills/security-audit/run.sh` | 72 contrôles de sécurité, référence **72 PASS / 0 FAIL** |
| `node .claude/tools/ai-council.mjs --status` | revue croisée multi-modèles |
| `node .claude/tools/sync-agent-docs.mjs --check` | vérifie que les fichiers dérivés sont à jour |

Ces scripts sont des exécutables shell ordinaires : ils fonctionnent depuis
n'importe quel agent ou terminal, indépendamment de l'outil qui les invoque.

## Structure (Nuxt 4)

Le code applicatif est sous **`app/`**, le code serveur reste à la **racine**.

```
app/{app,error}.vue  app/assets/css/main.css  app/{components,layouts,pages}/
server/{api,plugins,utils}/
public/
```

Un `pages/` ou `components/` placé à la racine est **silencieusement ignoré** —
aucune erreur, la route n'existe simplement pas. C'est le piège n°1 de la
migration v3→v4 : vérifier l'emplacement de tout fichier nouveau.

## Tailwind 4 — il n'y a pas de fichier de config

La configuration est en CSS dans `app/assets/css/main.css` (`@import`,
`@plugin`). L'ancien `tailwind.config.js` a été supprimé : il était
intégralement du code mort.

Classes renommées en v4, **sans aucun avertissement au build** :

| v3 | v4 |
| --- | --- |
| `bg-gradient-to-*` | `bg-linear-to-*` |
| `flex-grow` / `flex-shrink-0` | `grow` / `shrink-0` |
| `outline-none` | `outline-hidden` |
| `rounded` nu / `shadow` nu | `rounded-sm` / `shadow-sm` |

Autres régressions de preflight v4 :

- Les `<button>` n'ont **plus** `cursor: pointer` : l'ajouter explicitement.
- La couleur de bordure par défaut est `currentColor`, plus `gray-200`.
- `@apply` dans un `<style>` de SFC exigerait une directive `@reference` :
  utiliser les variables du thème (`var(--color-blue-500)`).

**Conséquence pour toute relecture :** `bg-linear-to-r`, `grow`, `shrink-0`,
`outline-hidden` sont du Tailwind 4 **valide**. Ne pas les signaler comme des
fautes de frappe ou des classes inexistantes.

## Invariants de sécurité

`SECURITY.md` documente les contrôles en place **et les risques résiduels déjà
assumés** — le lire avant de signaler une faille, pour ne pas re-signaler un
risque déjà tranché. Ne jamais casser :

- **`server/api/*.ts` : l'ordre des contrôles est délibéré.** Taille vérifiée
  *avant* `readBody`, débit *avant* validation.
- **`z.strictObject`**, jamais `z.object` : les clés inconnues sont rejetées.
- **Rejet `CR`/`LF`/`NUL`** sur toute chaîne atteignant un en-tête SMTP ou HTTP
  (injection d'en-têtes, exploitable dans la version précédente du projet).
- **Jamais `error.message` au client.** Détail dans les logs, message générique
  en réponse.
- **`runtimeConfig.smtp.pass` reste vide dans `nuxt.config.ts`.** Une valeur par
  défaut lue depuis `process.env` serait figée dans `.output/`.
- **`requireTLS` + `rejectUnauthorized: true`** sur le transport SMTP.

Le périmètre compte pour calibrer une gravité : sans session ni action
authentifiée, un « contournement CSRF » sur le formulaire de contact relève de
l'abus, pas de la vulnérabilité.

## Secrets

Ne pas lire `.env` : son contenu atterrirait dans l'historique de la
conversation. Utiliser `.env.example` pour la structure. Pour vérifier qu'une
clé est renseignée sans révéler sa valeur :

```bash
node -e 'console.log(!!process.env.NUXT_SMTP_PASS)'
```

## Icônes

`<Icon name="famille:nom" />`. Le bundle est **local** avec
`fallbackToApi: false` : une famille non installée ne s'affiche pas, et aucune
requête externe ne compense. Familles disponibles : `logos`, `mdi`,
`simple-icons`, `heroicons`. En ajouter une :
`npm i -D @iconify-json/<famille>` puis l'inscrire dans
`icon.serverBundle.collections` de `nuxt.config.ts`.

## Conventions

Interface et commentaires de code en **français**, accents inclus. Esthétique
« terminal » : conteneurs `bg-[#1E1E1E] rounded-xl overflow-hidden` avec barre
à trois pastilles, dégradés bleu→violet, animations `v-motion`
(`@vueuse/motion`).

## Git

**Aucun trailer `Co-Authored-By` dans les messages de commit.** Le propriétaire
du dépôt n'en veut pas dans son historique, sans exception — y compris pour un
co-auteur d'agent. Le hook `.claude/hooks/commit-policy.mjs` refuse toute
commande `git commit`, `git merge`, `git tag -a` ou `gh pr create` dont le
message en contient un.

Ne committer et ne pousser que sur demande explicite.

## Attentes de restitution

Un build qui passe ne prouve rien sur le rendu : Tailwind 4 casse des classes
en silence. Pour toute modification visuelle, vérifier le CSS compilé ou la page
servie.

Sur un signalement de problème : `fichier:ligne`, ce qui casse, et un scénario
concret de déclenchement. Séparer ce qui a été **vérifié** de ce qui est
**supposé**. Ne pas gonfler une gravité pour faire nombre.
