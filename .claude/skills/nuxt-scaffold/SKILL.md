---
name: nuxt-scaffold
description: Conventions de ce portfolio pour ajouter une page, un composant, un endpoint API ou une icône. À utiliser dès qu'on crée un nouveau fichier dans app/ ou server/, pour respecter la structure Nuxt 4 et les invariants de sécurité en place.
---

# Ajouter du code à ce portfolio

## Où va quoi (Nuxt 4)

```
app/                 code applicatif — PAS à la racine
  app.vue            racine
  error.vue          page d'erreur
  assets/css/main.css point d'entrée Tailwind (@import + @plugin)
  components/        auto-importés, pas d'import à écrire
  layouts/
  pages/             routage par fichiers
server/              code serveur — reste à la RACINE
  api/               endpoints Nitro
  plugins/           plugins Nitro
  utils/             auto-importés côté serveur
public/              servi tel quel
```

Placer un `pages/` ou `components/` à la racine ne produit **aucune erreur** —
le fichier est simplement ignoré. C'est le piège classique de la migration v3→v4.

## Nouvelle page

```vue
<template>
  <main class="min-h-screen pt-10 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- … -->
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Titre' })   // titleTemplate global ajoute « | Fabien Lubin »
</script>
```

Conventions du projet, à respecter pour la cohérence visuelle :

- Esthétique « terminal » : conteneurs `bg-[#1E1E1E] rounded-xl overflow-hidden`
  avec une barre de titre à trois pastilles.
- Dégradés `bg-linear-to-r from-blue-600 to-purple-600` (**pas**
  `bg-gradient-to-r`, supprimé en Tailwind 4).
- Animations d'entrée via `v-motion` + `:initial` / `:enter` (`@vueuse/motion`).
- `cursor-pointer` explicite sur tout `<button>` : le preflight Tailwind 4 ne
  le met plus.
- Textes en français, accents inclus.

La page apparaît automatiquement dans `sitemap.xml`. Pour l'exclure, l'ajouter
à `sitemap.exclude` dans `nuxt.config.ts`.

## Nouveau composant

Nommage `TheXxx.vue` pour les singletons (navbar, footer), `Xxx.vue` sinon.
Auto-importé : aucun `import` à écrire dans le template consommateur.

## Nouvel endpoint API

`server/api/<nom>.<méthode>.ts`. **Reprendre l'ordre des contrôles de
`contact.post.ts`** — il est délibéré :

```ts
import { z } from 'zod'

const schema = z.strictObject({ /* champs bornés */ })

export default defineEventHandler(async (event) => {
  // 1. Content-Type attendu           -> 415
  // 2. Content-Length AVANT readBody   -> 413
  // 3. Origin                          -> 403
  // 4. Débit par IP (server/utils/rate-limit.ts) -> 429 + Retry-After
  // 5. Validation stricte              -> 400, noms de champs seulement
  // 6. Travail utile
  // Erreurs : détail dans les logs, message générique au client.
})
```

Règles qui ne se négocient pas :

- `z.strictObject`, jamais `z.object` : les clés inconnues doivent être rejetées.
- Toute chaîne atteignant un en-tête (SMTP, HTTP) doit rejeter `CR`/`LF`/`NUL`.
- Ne jamais renvoyer `error.message` au client.
- Tout nouvel endpoint hérite de `Cache-Control: no-store` et
  `X-Robots-Tag: noindex` via la `routeRule` `/api/**`.

Après création : `.claude/skills/security-audit/run.sh`, et étendre
`pentest.py` pour couvrir le nouvel endpoint.

## Nouvelle icône

`<Icon name="famille:nom" />`. Le bundle est **local** et
`fallbackToApi: false` : une famille non installée ne s'affiche pas et aucune
requête externe ne compense.

```bash
npm i -D @iconify-json/<famille>
# puis ajouter <famille> à icon.serverBundle.collections dans nuxt.config.ts
```

Familles déjà disponibles : `logos`, `mdi`, `simple-icons`, `heroicons`.

## Avant de considérer le travail fini

```bash
npm run lint && npm run typecheck && npm run build
```

Le hook `lint-touched` passe déjà ESLint `--fix` sur chaque fichier édité.
