#!/usr/bin/env node
/**
 * PostToolUse — audite les dépendances dès que `package.json` change.
 *
 * Le projet est passé de 48 vulnérabilités (5 critiques) à 0 ; ce hook existe
 * pour que ça reste vrai. Il ne se déclenche que sur `package.json`, donc
 * rarement — le coût (~3 s + réseau) est acceptable à cette fréquence.
 *
 *   - vulnérabilité high/critical -> exit 2 (Claude doit traiter)
 *   - moderate/low                -> additionalContext (informatif)
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

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
if (!filePath || basename(filePath) !== 'package.json') process.exit(0)

const cwd = payload.cwd || process.cwd()
// Un package.json de dépendance, pas celui du projet.
if (filePath.includes('node_modules')) process.exit(0)
if (!existsSync(resolve(cwd, 'package-lock.json'))) process.exit(0)

let stdout = ''
try {
  const res = await run('npm', ['audit', '--json'], { cwd, timeout: 90_000, maxBuffer: 32 * 1024 * 1024 })
  stdout = res.stdout
}
catch (error) {
  // `npm audit` sort en code 1 quand il trouve quelque chose : la sortie est bonne.
  if (error.stdout) stdout = error.stdout
  else process.exit(0)
}

let report
try {
  report = JSON.parse(stdout)
}
catch {
  process.exit(0)
}

// Lockfile désynchronisé après une édition manuelle de package.json.
if (report.error) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `package.json a changé mais \`npm audit\` n'a pas pu s'exécuter `
        + `(${report.error.summary ?? 'lockfile probablement désynchronisé'}). `
        + `Lance \`npm install\` pour régénérer package-lock.json, puis \`npm audit\`.`,
    },
  }))
  process.exit(0)
}

const counts = report.metadata?.vulnerabilities ?? {}
const blocking = (counts.critical ?? 0) + (counts.high ?? 0)
const minor = (counts.moderate ?? 0) + (counts.low ?? 0) + (counts.info ?? 0)

if (!blocking && !minor) process.exit(0)

const named = Object.entries(report.vulnerabilities ?? {})
  .filter(([, v]) => ['critical', 'high'].includes(v.severity))
  .slice(0, 12)
  .map(([name, v]) => `  ${v.severity.padEnd(8)} ${name} ${v.range}`)
  .join('\n')

if (blocking) {
  process.stderr.write(
    `npm audit — ${counts.critical ?? 0} critique(s) et ${counts.high ?? 0} high `
    + `introduite(s) après modification de package.json :\n${named}\n`
    + `Ce projet a été remis à 0 vulnérabilité : ne pas régresser. `
    + `Résous en montant les versions concernées (\`npm audit fix\`, ou une montée majeure si nécessaire).\n`,
  )
  process.exit(2)
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PostToolUse',
    additionalContext:
      `npm audit : ${minor} vulnérabilité(s) moderate/low après modification de package.json `
      + `(aucune high/critical). À traiter, sans urgence.`,
  },
}))
