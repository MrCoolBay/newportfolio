---
description: Soumet le travail en cours à plusieurs LLM (Claude, Gemini, GPT, Grok) et confronte leurs avis
argument-hint: "[review|security|architecture] [chemin ou question]"
---

Revue croisée multi-modèles via `.claude/tools/ai-council.mjs`.

## 1. Vérifier ce qui est disponible

```bash
node .claude/tools/ai-council.mjs --status
```

Si aucun fournisseur n'est actif : indique à l'utilisateur les variables à
exporter dans son shell (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`,
`OPENAI_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, ou `OLLAMA_HOST`),
**ne demande jamais une clé dans la conversation**, et propose de faire la revue
avec un seul modèle en attendant.

## 2. Lancer

Le preset vient du premier argument (`review` par défaut). La cible vient du
reste des arguments : un chemin de fichier, une question, ou rien — dans ce cas
utilise le diff courant.

```bash
# diff courant
git diff HEAD | node .claude/tools/ai-council.mjs --stdin --preset review

# fichier précis
node .claude/tools/ai-council.mjs --file <chemin> --preset security

# question libre
node .claude/tools/ai-council.mjs --preset architecture --prompt "<question>"
```

Si le diff est vide, essaie `git diff --cached`, puis `git diff main...HEAD`.

## 3. Restituer — c'est là qu'est ton travail

Ne recopie pas les réponses brutes. Produis une synthèse :

1. **Vérifie chaque finding** dans le code avant de le transmettre. Les modèles
   externes lisent un diff hors contexte : ils hallucinent des numéros de ligne
   et signalent des problèmes déjà traités ailleurs dans le fichier. Un finding
   non confirmé ne doit pas remonter à l'utilisateur.
2. **Consensus** — ce que plusieurs modèles signalent indépendamment, vérifié.
3. **Désaccords** — expose-les, tranche avec le code sous les yeux. C'est
   souvent là que se cache le vrai problème.
4. **Écarté** — ce qui a été signalé mais qui est faux, avec la raison en une
   ligne.

Termine par ce que tu recommandes de corriger, par ordre de priorité.
