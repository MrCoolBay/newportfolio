---
description: Boucle de montée de version des dépendances, avec garde-fou anti-régression de sécurité
argument-hint: "[paquet]"
---

Monte les dépendances de ce projet en préservant l'état `0 vulnérabilité`.

Charge le skill `deps-upgrade` : il contient les pièges spécifiques à ce dépôt
(Node LTS, npm 11, classes Tailwind 4 renommées, secrets figés au build).

## Marche à suivre

```bash
nvm use && npm --version   # Node 22 LTS, npm >= 11
npm audit                  # état de référence
npm outdated
```

Sans argument, traite tout ce qui est en retard. Avec un argument, limite-toi à
ce paquet.

Pour chaque candidat, **avant** d'installer :

```bash
npm view <pkg>@latest peerDependencies engines
```

Et vérifie que le paquet sert encore à quelque chose :

```bash
grep -rn "<pkg ou son API>" app server nuxt.config.ts
```

Une dépendance non utilisée se supprime — c'est mieux que de la monter.

## Après chaque changement

```bash
npm run lint && npm run typecheck && npm run build
npm audit
```

Un build qui passe **ne suffit pas** : Tailwind 4 casse des classes sans aucun
avertissement. Si la montée touche Tailwind, Vue ou Nuxt, lance
`/audit` en entier et vérifie le CSS compilé.

## Restitution

Tableau : paquet, version avant → après, ce qui a changé de comportement, ce
que tu as vérifié. Signale explicitement ce que tu as choisi de **ne pas**
monter et pourquoi. Ne dis pas « à jour » sans avoir revu la sortie de
`npm audit`.
