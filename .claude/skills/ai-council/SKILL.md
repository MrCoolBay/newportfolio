---
name: ai-council
description: Interroge plusieurs LLM (Claude, Gemini, GPT, Grok, OpenRouter, Ollama) en parallèle sur une même question et compare leurs réponses. À utiliser quand l'utilisateur demande un second avis, une revue croisée multi-modèles, ou de confronter plusieurs IA sur un diff, une décision d'architecture ou un audit de sécurité.
---

# Conseil multi-modèles

Éventail parallèle vers plusieurs fournisseurs de LLM, réponses rendues côte à
côte. Utile quand un seul modèle risque d'avoir un angle mort : revue de
sécurité, décision d'architecture, relecture d'un diff sensible.

## À faire en premier

```bash
node .claude/tools/ai-council.mjs --status
```

Si aucun fournisseur n'est actif, **ne devine pas de clé et n'en demande pas
dans la conversation** : indique à l'utilisateur les variables à exporter dans
son shell, et propose de continuer avec une revue mono-modèle en attendant.

## Usage

```bash
# Revue croisée du travail en cours
git diff | node .claude/tools/ai-council.mjs --stdin --preset review

# Audit de sécurité d'un endpoint
node .claude/tools/ai-council.mjs --file server/api/contact.post.ts --preset security

# Décision d'architecture
node .claude/tools/ai-council.mjs --preset architecture --prompt "$(cat notes.md)"

# Question libre, fournisseurs choisis
node .claude/tools/ai-council.mjs --providers gemini,openai --prompt "..."
```

Presets : `review`, `security`, `architecture`, `raw`.
Options utiles : `--json`, `--providers`, `--timeout <s>`, `--list`, `--refresh-models`.

## Fournisseurs et variables

| Fournisseur | Variable | Notes |
| --- | --- | --- |
| `anthropic` | `ANTHROPIC_API_KEY` | API Messages native |
| `gemini` | `GEMINI_API_KEY` ou `GOOGLE_API_KEY` | `generateContent` |
| `openai` | `OPENAI_API_KEY` | `/chat/completions` |
| `xai` | `XAI_API_KEY` | compatible OpenAI |
| `openrouter` | `OPENROUTER_API_KEY` | une seule clé donne accès à tous les modèles ; exige `COUNCIL_OPENROUTER_MODEL` |
| `ollama` | `OLLAMA_HOST` | local, sans clé |

Surcharges : `COUNCIL_<FOURNISSEUR>_MODEL` fige un identifiant de modèle,
`COUNCIL_<FOURNISSEUR>_BASE_URL` route via une passerelle ou un proxy.

## Contexte projet transmis automatiquement

Chaque appel envoie `AGENTS.md` dans le message système, et `SECURITY.md` en
plus pour le preset `security`. C'est indispensable : sans ça, un modèle tiers
relit le code sans savoir que Tailwind 4 a renommé `bg-gradient-to-*` en
`bg-linear-to-*`, ni que le code applicatif vit sous `app/`, ni quels
invariants sont déjà en place — et il produit des findings faux avec assurance.

L'en-tête de sortie indique ce qui a été transmis. `--no-context` désactive
l'envoi (utile pour une question sans rapport avec le dépôt), au prix de la
fiabilité des findings.

## Comment les modèles sont choisis

Les identifiants de modèles changent vite, donc rien n'est figé dans le code.
Priorité : `COUNCIL_<PROV>_MODEL` > cache local (24 h) > **découverte via
`/models`** avec classement par famille > repli codé en dur.

Conséquence pratique : `--list` affiche ce que le fournisseur sert *réellement*
aujourd'hui, avec `*` sur le modèle retenu. C'est la source de vérité, pas la
mémoire du modèle qui lit ce fichier.

## Exploiter les réponses

Les modèles se contredisent, c'est l'intérêt. En rendant compte :

- **Vérifie avant de rapporter.** Un finding produit par un modèle externe est
  une hypothèse, pas un fait. Ouvre le fichier et confirme avant de le
  transmettre à l'utilisateur.
- **Signale les désaccords** plutôt que de les moyenner — c'est souvent là que
  se cache le vrai problème.
- **Écarte les hallucinations de numéros de ligne**, fréquentes sur un diff
  fourni hors contexte.
- Un fournisseur en échec n'invalide pas les autres : le script sort en code 0
  dès qu'au moins un a répondu.
