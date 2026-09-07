---
name: security-audit
description: Lance la campagne de tests de sécurité (72 contrôles) contre un build de production de ce portfolio, avec relais SMTP factice. À utiliser avant un déploiement, après toute modification de server/api/, de nuxt.config.ts, ou quand on demande un audit/pentest du site.
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
démarre un relais SMTP factice, lance les 72 contrôles, inspecte le trafic SMTP
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

`72 PASS / 0 FAIL` est l'état de référence. Toute régression est un blocage
de déploiement.

Deux faux échecs connus, à ne pas confondre avec des régressions :

- **Le chemin nominal échoue en 429** si le harness a déjà tourné dans l'heure :
  le garde-fou global (30 mails/h) est en mémoire du processus. Redémarrer le
  serveur remet le compteur à zéro.
- **Le chemin nominal échoue en 502** si `NODE_EXTRA_CA_CERTS` n'est pas passé :
  c'est le durcissement TLS (`rejectUnauthorized`) qui refuse le certificat
  auto-signé du relais. C'est le comportement correct.

## Cibler un serveur distant : à éviter

Le harness est fait pour un build de **production local**. Les `routeRules` et
le handler y sont identiques à la production ; ce qui diffère, c'est ce qui se
trouve devant.

En distant, deux garde-fous coupent la campagne plutôt que de rendre des
verdicts faux :

- **`exit 2` — cible invalide.** Le préflight vérifie que la cible sert bien
  cette application (asset `/_nuxt/`, et `POST /api/contact` en `text/plain`
  qui répond 415). Sinon la campagne s'arrête avant la première assertion. Sans
  ça, une cible injoignable produit des dizaines de FAIL trompeurs — et des
  PASS, puisque « la réponse ne fuit pas `zod` » passe trivialement sur une
  page de redirection.
- **`exit 3` — pare-feu de l'hébergeur.** Cette campagne *est* un trafic
  d'attaque : charges d'injection, `X-Forwarded-For` usurpé, corps
  surdimensionnés, rafales. Un WAF la bloque, et c'est son travail. Constaté
  sur ce projet : Vercel a fini par servir « Vercel Security Checkpoint » sur
  **toutes** les routes, IP source défiée durablement.

En distant, s'en tenir à un contrôle d'en-têtes sur une requête isolée :

```bash
curl -sI https://www.fabienlubin.fr/ | grep -iE "content-security|strict-transport|x-frame"
```

## Invariants à ne jamais casser

Ils sont documentés dans `SECURITY.md`. Les plus fragiles :

- `server/api/contact.post.ts` — l'ordre des contrôles compte. La taille est
  vérifiée **avant** `readBody`, le débit **avant** la validation.
- Le rejet `CR`/`LF`/`NUL` sur tout champ atteignant un en-tête SMTP.
- `runtimeConfig.smtp.pass` doit rester vide dans `nuxt.config.ts` : une valeur
  par défaut lue depuis `process.env` serait figée dans le build.
- `rejectUnauthorized: true` et `requireTLS` sur le transport SMTP.
