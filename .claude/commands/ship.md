---
description: Porte de sortie avant déploiement — vérifie le code, les secrets et l'absence de fuite dans le build
---

Contrôle de pré-déploiement. Rends un verdict **GO** ou **NO-GO** argumenté.

## 1. La chaîne complète

Lance `/audit`. Un seul échec ⇒ NO-GO immédiat, inutile de continuer.

## 2. Aucun secret dans le build

```bash
grep -rl "$(grep '^NUXT_SMTP_PASS' .env.example | cut -d= -f2)" .output 2>/dev/null || echo "motif de gabarit absent du build (attendu)"
```

Vérifie surtout que la vraie valeur n'y est pas, **sans jamais l'afficher** :

```bash
node -e '
const fs=require("fs"),path=require("path");
const v=(fs.readFileSync(".env","utf8").match(/^NUXT_SMTP_PASS=(.+)$/m)||[])[1];
if(!v){console.log("NUXT_SMTP_PASS non renseigné localement");process.exit(0)}
let hits=0;
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,e.name);
  if(e.isDirectory())walk(p);
  else try{if(fs.readFileSync(p,"utf8").includes(v))hits++}catch{}
}})(".output");
console.log(hits?`FUITE : ${hits} fichier(s) du build contiennent le secret`:"aucune fuite du secret dans .output");
'
```

Une fuite ⇒ NO-GO, et le mot de passe SMTP doit être **changé**, pas seulement
retiré du build.

## 3. Hygiène git

```bash
git status --short
git check-ignore -v .env
```

`.env` doit être ignoré. Signale tout fichier non suivi qui ressemble à un
secret. Ne committe rien sans que l'utilisateur l'ait demandé.

## 4. Rappels de déploiement

Vérifie et rappelle à l'utilisateur :

- Le Node de l'hébergeur doit respecter `engines` de `package.json`.
- `NUXT_SMTP_PASS` doit être défini côté hébergeur (l'ancien nom `SMTP_PASS`
  reste accepté en secours, mais est déprécié).
- `NUXT_PUBLIC_SITE_URL` doit correspondre au domaine réel, sinon sitemap,
  `robots.txt` et balises Open Graph pointeront au mauvais endroit.

## Verdict

**GO** ou **NO-GO**, puis la liste de ce qui reste à faire. Si tu n'as pas pu
vérifier un point, dis-le explicitement au lieu de le supposer conforme.
