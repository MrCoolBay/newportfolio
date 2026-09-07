# Sécurité

Périmètre : site vitrine sans authentification, sans base de données, sans
contenu utilisateur persisté. La seule surface d'écriture est
`POST /api/contact`, qui déclenche l'envoi d'un mail.

## Contrôles en place

### En-têtes de réponse (`nuxt.config.ts`, `routeRules`)

| En-tête                             | Valeur                                    |
| ----------------------------------- | ----------------------------------------- |
| `Content-Security-Policy`           | `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'` |
| `Strict-Transport-Security`         | `max-age=31536000`                        |
| `X-Content-Type-Options`            | `nosniff`                                 |
| `X-Frame-Options`                   | `DENY`                                    |
| `Referrer-Policy`                   | `strict-origin-when-cross-origin`         |
| `Permissions-Policy`                | caméra, micro, géoloc, paiement, USB refusés |
| `Cross-Origin-Opener-Policy`        | `same-origin`                             |
| `Cross-Origin-Resource-Policy`      | `same-origin`                             |
| `X-Permitted-Cross-Domain-Policies` | `none`                                    |

`/api/**` reçoit en plus `Cache-Control: no-store` et
`X-Robots-Tag: noindex, nofollow`.

L'en-tête `x-powered-by: Nuxt` est retiré par
`server/plugins/strip-powered-by.ts`.

### `POST /api/contact`

Contrôles appliqués dans cet ordre :

1. **Content-Type** — tout ce qui n'est pas `application/json` → `415`.
2. **Taille** — `Content-Length > 16 Ko` refusé **avant** lecture du corps → `413`.
3. **Origine** — `Origin` étranger → `403` (mesure anti-abus, pas une frontière
   de sécurité : il n'y a ni session ni action authentifiée à protéger).
4. **Débit par IP** — 3 tentatives / 10 min, appliqué avant tout travail
   coûteux ; `429` + `Retry-After`.
5. **Validation** — schéma Zod strict (`z.strictObject`) : clés inconnues
   refusées, longueurs bornées, e-mail validé, `CR`/`LF`/`NUL` interdits dans
   tout champ réinjecté dans un en-tête SMTP.
6. **Piège à bots** — champ `website` masqué ; s'il est rempli, l'API renvoie un
   faux `200` sans envoyer de mail.
7. **Quota global** — 30 mails / heure, compté uniquement sur les envois réels.

Autres points :

- **STARTTLS obligatoire** (`requireTLS`) avec `minVersion: TLSv1.2` et
  `rejectUnauthorized: true`. Sans cela, un attaquant en position d'homme du
  milieu peut supprimer l'annonce STARTTLS et récupérer les identifiants SMTP.
- **Mail en texte brut uniquement** — aucun HTML construit à partir de l'entrée
  utilisateur, donc aucune injection dans le client de messagerie.
- **Sujet et destinataire statiques** ; seul `Reply-To` reçoit une valeur
  utilisateur, après validation stricte.
- **Erreurs opaques** — le détail SMTP reste dans les logs serveur ; le client
  reçoit un message générique. Les réponses `400` ne renvoient que les *noms*
  des champs invalides, jamais les valeurs soumises.
- **Pas de `messageId` renvoyé** — il divulgue le domaine du relais SMTP.
- **Pas de `transporter.verify()` par requête** — la version précédente ouvrait
  une connexion SMTP avant chaque traitement, offrant un levier d'amplification
  vers le relais depuis une simple requête HTTP.

### Secrets

`NUXT_SMTP_PASS` n'a **aucune valeur par défaut** dans `nuxt.config.ts` : une
valeur lue depuis `process.env` au moment du build serait figée dans `.output/`.
Vérifié : le mot de passe n'apparaît ni dans le bundle serveur ni dans le bundle
client.

### Dépendances

```bash
npm run audit    # échoue dès une vulnérabilité "moderate"
```

## Risques résiduels assumés

| Risque | Détail | Atténuation |
| ------ | ------ | ----------- |
| **`X-Forwarded-For` falsifiable** | Le quota par IP se contourne en faisant varier l'en-tête. | Le quota **global** (30 mails/h) borne le dommage. Si un reverse proxy de confiance est en place, préférer l'IP qu'il fournit. |
| **Rate limit en mémoire** | L'état est local au processus : en multi-instance, chaque instance applique sa propre fenêtre. | Remplacer le `Map` de `server/utils/rate-limit.ts` par Redis / Nitro storage en cas de scale horizontal. |
| **CSP avec `'unsafe-inline'`** | Imposé par le script inline du payload SSR de Nuxt et les styles inline de Vue / `@vueuse/motion`. | Aucune ressource tierce n'est chargée (`icon.fallbackToApi: false`), la CSP reste limitée à `'self'`. Un durcissement par nonce demanderait un middleware dédié. |
| **HSTS sans `includeSubDomains` ni `preload`** | Choix volontaire : `includeSubDomains` casserait tout sous-domaine servi en HTTP. | À ajouter après vérification que tous les sous-domaines sont en HTTPS. |
| **Pas de CAPTCHA** | Le piège à bots et les quotas suffisent au volume actuel. | Ajouter un challenge (Turnstile / hCaptcha) si le spam persiste. |
