#!/usr/bin/env node
/**
 * PostToolUse — passe ESLint --fix sur le seul fichier qui vient d'être modifié.
 *
 * Pourquoi ciblé et pas global : `eslint .` sur tout le projet prend plusieurs
 * secondes et rapporte du bruit sans lien avec l'édition en cours. Un fichier =
 * ~1 s, et le retour est directement actionnable.
 *
 * Contrat de sortie :
 *   - erreurs ESLint restantes  -> exit 2 + stderr (Claude doit corriger)
 *   - seulement des warnings    -> additionalContext (informatif)
 *   - rien à signaler           -> silence
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const LINTABLE = /\.(vue|ts|mts|js|mjs|cjs)$/
const TIMEOUT_MS = 20_000

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let payload
try {
  payload = JSON.parse(raw || '{}')
}
catch {
  process.exit(0)
}

const cwd = payload.cwd || process.cwd()
const filePath = payload.tool_input?.file_path
if (!filePath || !LINTABLE.test(filePath)) process.exit(0)

const abs = resolve(cwd, filePath)
const rel = relative(cwd, abs)

// Hors du projet, ou fichier supprimé entre-temps.
if (rel.startsWith('..') || !existsSync(abs)) process.exit(0)

const eslintBin = resolve(cwd, 'node_modules/.bin/eslint')
const generatedConfig = resolve(cwd, '.nuxt/eslint.config.mjs')

// Dépendances non installées, ou `nuxt prepare` pas encore passé : on sort en
// silence plutôt que d'afficher une erreur d'outillage à chaque édition.
if (!existsSync(eslintBin) || !existsSync(generatedConfig)) process.exit(0)

let stdout = ''
try {
  const res = await run(eslintBin, ['--fix', '--format', 'json', abs], {
    cwd,
    timeout: TIMEOUT_MS,
    maxBuffer: 8 * 1024 * 1024,
  })
  stdout = res.stdout
}
catch (error) {
  // ESLint sort en code 1 dès qu'il reste une erreur : la sortie JSON est
  // valide et c'est précisément ce qui nous intéresse.
  if (error.stdout) stdout = error.stdout
  else process.exit(0) // binaire absent, timeout, crash : ne jamais bloquer
}

let report
try {
  report = JSON.parse(stdout)
}
catch {
  process.exit(0)
}

const result = report?.[0]
if (!result) process.exit(0)

const problems = (result.messages ?? []).filter(m => !m.fix)
const errors = problems.filter(m => m.severity === 2)
const warnings = problems.filter(m => m.severity === 1)

const format = list => list
  .slice(0, 15)
  .map(m => `  ${rel}:${m.line}:${m.column}  ${m.message} (${m.ruleId ?? 'syntaxe'})`)
  .join('\n')

if (errors.length) {
  process.stderr.write(
    `ESLint — ${errors.length} erreur(s) non corrigeable(s) automatiquement dans ${rel} :\n`
    + `${format(errors)}\n`
    + (errors.length > 15 ? `  … ${errors.length - 15} de plus\n` : '')
    + `Corrige-les avant de continuer.\n`,
  )
  process.exit(2)
}

if (warnings.length) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `ESLint a laissé ${warnings.length} warning(s) dans ${rel} `
        + `(non bloquant, les corrections automatiques ont déjà été appliquées) :\n${format(warnings)}`,
    },
  }))
}

process.exit(0)
