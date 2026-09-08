<!-- GÉNÉRÉ depuis AGENTS.md — NE PAS ÉDITER CE FICHIER.
     Modifier AGENTS.md, puis lancer : node .claude/tools/sync-agent-docs.mjs
     Destinataire : GitHub Copilot / VS Code. -->

# Portfolio fabienlubin.fr — instructions pour agents

Portfolio Nuxt 4 / Vue 3 / Tailwind 4. Site vitrine : pas d'authentification,
pas de base de données. La seule surface d'écriture est `POST /api/contact`.

## Avant toute commande

```bash
nvm use    # Node 24 LTS via .nvmrc
```

**Un seul runtime : Node 24.** C'est celui que sert Vercel en production, donc
`.nvmrc` et `engines.node` s'y tiennent. Cette égalité dev/prod n'est pas
cosmétique : deux bugs de ce projet venaient d'un décalage de version de Node.

Pièges déjà rencontrés :

- **Node impair (23, 25) ne marche pas** — ces versions ne sont pas LTS et sont
  hors de la plage supportée par Nuxt. Le Node par défaut de cette machine
  (25.x) en fait partie : toujours `nvm use` avant npm ou nuxt.
- **Node 22 n'est plus supporté ici.** Il fonctionne techniquement avec Nuxt,
  mais la production est en 24 et on ne maintient pas deux runtimes.
- **npm 10.9.x échoue** sur `npm install` (`Cannot read properties of null
  (reading 'edgesOut')`, bug arborist). npm >= 11 requis — Node 24 l'embarque.

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

`server/api/github.get.ts` est une exception assumée à l'ordre des contrôles :
c'est un GET sans entrée utilisateur, donc sans surface d'injection. Il n'a pas
besoin de validation Zod. Ce qui compte pour lui : garder le cache serveur
(l'API GitHub non authentifiée plafonne à 60 requêtes/heure et par IP), borner
les champs venus de GitHub, et se masquer côté client en cas d'échec plutôt que
de casser la page. Ne jamais y introduire de jeton d'accès : le site est public
et n'en a pas besoin.

**Aucune ressource tierce dans le navigateur.** La CSP est en `default-src
'self'` et `img-src 'self' data:`. Les cartes GitHub toutes faites
(github-readme-stats, ghchart…) sont des images distantes : elles seraient
bloquées. Passer par une route serveur, comme pour le résumé GitHub.

## SEO — invariants à ne pas casser

- **Jamais de `canonical` dans `nuxt.config.ts`.** Une balise globale rend
  toutes les pages canoniques vers l'accueil et invite les moteurs à
  désindexer le reste. La canonical est calculée par route dans `app/app.vue`.
- **`SITE_URL` désigne `https://www.fabienlubin.fr`**, pas l'apex : celui-ci
  redirige en 308 et tout signal qui le traverse se dilue.
- **Chaque page a un titre et une description uniques**, via `useSeoMeta`. Des
  descriptions dupliquées valent une absence de description.
- **`public/og-image.png` doit exister** en 1200×630. Régénération :
  `scripts/generate-og-image.sh` (source `scripts/og-image.svg`). Ne pas
  installer `nuxt-og-image` : il tire un Chrome headless pour une carte
  statique.
- **Le graphe schema.org tient deux entités distinctes** : `Person`
  (`#identity`) et `ProfessionalService` (`#business`, lié par `founder`). Les
  fusionner produit un `Organization` porteur de `jobTitle` et `alumniOf`,
  propriétés réservées à `Person` — graphe invalide.
- **Aucune adresse postale dans le JSON-LD.** Le signal géographique passe par
  `areaServed`. Le siège est une adresse personnelle.
- **Les crawlers d'IA sont autorisés volontairement** dans `robots.groups`, et
  `public/llms.txt` résume le site pour eux. C'est un choix de visibilité, pas
  un oubli.
- **Budget de l'écran de chargement : ~1,2 s maximum**, sans verrou
  `overflow: hidden` sur le body. Il faisait 5,8 s en calque blanc opaque, ce
  qui mesurait le calque comme Largest Contentful Paint.

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

Interface et commentaires de code en **français**, accents inclus.

### Charte graphique

Les couleurs passent **uniquement** par les jetons définis dans
`app/assets/css/main.css`. Ne jamais écrire de couleur Tailwind brute
(`amber-*`, `zinc-*`) ni d'hexadécimal dans un composant : le violet précédent
était éparpillé sur 31 occurrences, ce qui rendait tout changement de charte
incomplet.

| Jeton | Rôle |
| --- | --- |
| `ink`, `ink-soft`, `ink-muted` | encre des titres, du corps, des libellés secondaires |
| `accent-700` | texte courant et aplats de boutons **sur fond clair** |
| `accent-600` | aplats décoratifs, icônes, gros titres — **pas** de petit texte |
| `accent-400` / `accent-500` | accents **sur fond sombre** |
| `shell`, `shell-bar` | fonds des blocs « terminal » |

Contraintes de contraste mesurées, à ne pas casser : `accent-600` n'atteint que
**3,19:1** sur blanc — insuffisant pour du texte courant (AA exige 4,5:1), mais
valide pour un aplat ou une icône (seuil 3:1). `accent-700` donne 5,02:1 et
convient au texte comme au fond de bouton avec libellé blanc.

**Pas de dégradés deux-tons.** Les titres sont des aplats `text-ink` ; les
sections sont séparées par un filet neutre avec une amorce d'accent de 4 rem.

### Structure visuelle

Esthétique « terminal » : conteneurs `bg-shell rounded-xl overflow-hidden` avec
barre à trois pastilles, animations d'entrée `v-motion` (`@vueuse/motion`).
`PageHeader` porte le `h1` de chaque page — une page, un seul `h1`.

### Contenu

Le site est à la fois CV et vitrine de l'auto-entreprise : toute page doit
laisser visible la disponibilité en freelance et un chemin vers `/contact`.
Les expériences et formations de `app/pages/about.vue` doivent rester
conformes au CV réel — ne jamais inventer de mission, de client, de chiffre ou
d'outil.

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
