---
name: security-audit
description: Lance la campagne de tests de sécurité (71 contrôles) contre un build de production de ce portfolio, avec relais SMTP factice. À utiliser avant un déploiement, après toute modification de server/api/, de nuxt.config.ts, ou quand on demande un audit/pentest du site.
---

# Audit de sécurité du portfolio

Campagne de tests boîte-noire contre un build de **production** (`.output/`), pas
le serveur de dev. Le serveur de dev n'applique pas les mêmes `routeRules` et
donnerait un faux sentiment de sécurité.

## Lancer

```bash
.claude/skills/security-audit/run.sh
```

Le script est autonome : il construit si nécessaire, génère un certificat,
démarre un relais SMTP factice, lance les 71 contrôles, inspecte le trafic SMTP
brut, puis nettoie. **Aucun mail ne part vers une vraie adresse.**

Cibler un serveur déjà démarré :

```bash
TARGET=http://127.0.0.1:3000 python3 .claude/skills/security-audit/pentest.py
```

## Ce qui est couvert

| Section | Contrôles |
| --- | --- |
| En-têtes de sécurité | CSP, HSTS, COOP/CORP, Permissions-Policy, absence de `x-powered-by` |
| Exposition de fichiers | `.env`, `.git/`, sources, traversées encodées (15 chemins) |
| Surface de l'API | méthodes, `Content-Type`, taille du corps, `Origin`, cache |
| Validation | 12 cas (types, longueurs, JSON malformé, clés inconnues) |
| Injection d'en-têtes SMTP | 7 vecteurs CRLF/NUL/multi-destinataires |
| Pollution de prototype | `__proto__`, `constructor.prototype` |
| Fuite d'information | traces, chemins, hôte SMTP, valeurs soumises |
| Piège à bots | faux succès sans envoi |
| Limitation de débit | quota par IP + garde-fou global |
| Chemin nominal | inspection du mail réellement émis |

## Lire le résultat

`71 PASS / 0 FAIL` est l'état de référence. Toute régression est un blocage
de déploiement.

Deux faux échecs connus, à ne pas confondre avec des régressions :

- **Le chemin nominal échoue en 429** si le harness a déjà tourné dans l'heure :
  le garde-fou global (30 mails/h) est en mémoire du processus. Redémarrer le
  serveur remet le compteur à zéro.
- **Le chemin nominal échoue en 502** si `NODE_EXTRA_CA_CERTS` n'est pas passé :
  c'est le durcissement TLS (`rejectUnauthorized`) qui refuse le certificat
  auto-signé du relais. C'est le comportement correct.

## Invariants à ne jamais casser

Ils sont documentés dans `SECURITY.md`. Les plus fragiles :

- `server/api/contact.post.ts` — l'ordre des contrôles compte. La taille est
  vérifiée **avant** `readBody`, le débit **avant** la validation.
- Le rejet `CR`/`LF`/`NUL` sur tout champ atteignant un en-tête SMTP.
- `runtimeConfig.smtp.pass` doit rester vide dans `nuxt.config.ts` : une valeur
  par défaut lue depuis `process.env` serait figée dans le build.
- `rejectUnauthorized: true` et `requireTLS` sur le transport SMTP.
