#!/usr/bin/env node
/**
 * PostToolUse — maintient les fichiers d'instructions par outil synchronisés.
 *
 * Deux cas :
 *   - AGENTS.md modifié      -> régénère les dérivés et le signale.
 *   - un dérivé modifié      -> avertit que l'édition sera écrasée, et indique
 *                               où porter le changement.
 *
 * Sans ce garde-fou, CLAUDE.md et GEMINI.md divergent en quelques jours et les
 * agents non-Claude travaillent sur des conventions périmées — exactement le
 * problème que la génération est censée résoudre.
 */
import { execFile } from 'node:child_process'
import { basename } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const SOURCE = 'AGENTS.md'
const DERIVED = new Set([
  'CLAUDE.md',
  'GEMINI.md',
  'copilot-instructions.md',
  'project.mdc',
])

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let payload
try {
  payload = JSON.parse(raw || '{}')
}
catch {
  process.exit(0)
}

const filePath = payload.tool_input?.file_path
if (!filePath) process.exit(0)

const cwd = payload.cwd || process.cwd()
const name = basename(filePath)

function emit(context) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context },
  }))
}

if (name === SOURCE) {
  try {
    const { stdout } = await run('node', ['.claude/tools/sync-agent-docs.mjs'], {
      cwd, timeout: 20_000,
    })
    const changed = stdout.split('\n').filter(l => /^\s*[+~]/.test(l)).map(l => l.trim())
    if (changed.length) {
      emit(
        `${SOURCE} a changé — fichiers d'instructions régénérés pour les autres outils :\n`
        + changed.map(l => `  ${l}`).join('\n')
        + `\nPenser à les inclure dans le commit.`,
      )
    }
  }
  catch { /* générateur indisponible : ne jamais bloquer une édition */ }
  process.exit(0)
}

if (DERIVED.has(name)) {
  process.stderr.write(
    `${name} est un fichier GÉNÉRÉ depuis ${SOURCE} : cette modification sera écrasée `
    + `au prochain \`node .claude/tools/sync-agent-docs.mjs\`.\n`
    + `Porte le changement dans ${SOURCE} à la racine du dépôt, puis régénère.\n`,
  )
  process.exit(2)
}

process.exit(0)
