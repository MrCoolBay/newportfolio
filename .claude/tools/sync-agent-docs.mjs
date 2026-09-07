#!/usr/bin/env node
/**
 * sync-agent-docs — dérive les fichiers d'instructions propres à chaque outil
 * agentique depuis l'unique source de vérité : AGENTS.md.
 *
 * POURQUOI
 * Chaque outil lit son propre fichier de conventions et ignore ceux des autres :
 *
 *   AGENTS.md                        Codex CLI, Amp, opencode, Zed, Jules (standard
 *                                    inter-éditeurs — c'est la source ici)
 *   CLAUDE.md                        Claude Code
 *   GEMINI.md                        Gemini CLI
 *   .github/copilot-instructions.md  GitHub Copilot / VS Code
 *   .cursor/rules/project.mdc        Cursor
 *
 * Maintenir cinq copies à la main garantit qu'elles divergeront. On en écrit
 * une, on génère le reste, et `--check` casse la chaîne de vérification dès
 * qu'un dérivé est périmé.
 *
 * USAGE
 *   node .claude/tools/sync-agent-docs.mjs           # (ré)génère
 *   node .claude/tools/sync-agent-docs.mjs --check    # exit 1 si périmé
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE = 'AGENTS.md'

/**
 * `frontmatter` est inséré tel quel avant le contenu ; `note` complète la
 * bannière quand l'outil a une contrainte propre à rappeler.
 */
const TARGETS = [
  {
    path: 'CLAUDE.md',
    tool: 'Claude Code',
    note: 'Outillage spécifique à Claude Code : skills `.claude/skills/`, '
      + 'sous-agents `.claude/agents/`, commandes `/audit` `/ship` `/council` `/upgrade-deps`.',
  },
  {
    path: 'GEMINI.md',
    tool: 'Gemini CLI',
  },
  {
    path: '.github/copilot-instructions.md',
    tool: 'GitHub Copilot / VS Code',
  },
  {
    path: '.cursor/rules/project.mdc',
    tool: 'Cursor',
    frontmatter: [
      '---',
      'description: Conventions, structure et invariants de sécurité du portfolio fabienlubin.fr',
      'globs: ["**/*"]',
      'alwaysApply: true',
      '---',
    ].join('\n'),
  },
]

/**
 * Retire le bloc de citation d'en-tête d'AGENTS.md : il désigne AGENTS.md comme
 * source de vérité, affirmation qui deviendrait fausse dans un fichier dérivé.
 */
function stripSourceBanner(markdown) {
  const lines = markdown.split('\n')
  const out = []
  let seenTitle = false
  let skipping = false

  for (const line of lines) {
    if (!seenTitle && line.startsWith('# ')) {
      seenTitle = true
      out.push(line)
      continue
    }
    if (seenTitle && !skipping && line.startsWith('>')) {
      skipping = true
      continue
    }
    if (skipping) {
      if (line.startsWith('>') || line.trim() === '') continue
      skipping = false
    }
    out.push(line)
  }
  return out.join('\n')
}

function render(target, body) {
  const banner = [
    `<!-- GÉNÉRÉ depuis ${SOURCE} — NE PAS ÉDITER CE FICHIER.`,
    `     Modifier ${SOURCE}, puis lancer : node .claude/tools/sync-agent-docs.mjs`,
    `     Destinataire : ${target.tool}. -->`,
  ].join('\n')

  const pieces = [
    target.frontmatter,
    banner,
    '',
    body.trimEnd(),
    target.note ? `\n## Pour ${target.tool}\n\n${target.note}` : null,
    '',
  ].filter(p => p !== null && p !== undefined)

  return pieces.join('\n')
}

const check = process.argv.includes('--check')
const body = stripSourceBanner(readFileSync(resolve(ROOT, SOURCE), 'utf8'))

const stale = []
for (const target of TARGETS) {
  const abs = resolve(ROOT, target.path)
  const next = render(target, body)

  let current = null
  try {
    current = readFileSync(abs, 'utf8')
  }
  catch { /* absent : à générer */ }

  if (current === next) {
    if (!check) process.stdout.write(`  = ${target.path}\n`)
    continue
  }

  stale.push(target.path)
  if (check) continue

  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, next)
  process.stdout.write(`  ${current === null ? '+' : '~'} ${target.path}\n`)
}

if (check) {
  if (stale.length) {
    process.stderr.write(
      `Fichiers d'instructions périmés par rapport à ${SOURCE} :\n`
      + stale.map(p => `  - ${p}`).join('\n')
      + `\n\nRégénérer : node .claude/tools/sync-agent-docs.mjs\n`,
    )
    process.exit(1)
  }
  process.stdout.write(`Les ${TARGETS.length} fichiers dérivés sont à jour avec ${SOURCE}.\n`)
  process.exit(0)
}

process.stdout.write(`\n${TARGETS.length} fichier(s) dérivé(s) de ${SOURCE}.\n`)
