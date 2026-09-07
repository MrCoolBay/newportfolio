#!/usr/bin/env node
/**
 * SessionStart — état de santé de l'environnement, injecté dans le contexte.
 *
 * Motivé par des pièges réels rencontrés sur ce projet :
 *   - Node 25 (impair, non LTS) est HORS de la plage supportée par Nuxt 4.5 ;
 *   - npm 10.9.x plante sur `npm install` ici (bug arborist « edgesOut ») ;
 *   - sans `.nuxt/`, ni le typecheck ni ESLint ne fonctionnent.
 *
 * N'échoue jamais : au pire il n'ajoute aucun contexte.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let cwd = process.cwd()
try {
  cwd = JSON.parse(raw || '{}').cwd || cwd
}
catch { /* entrée illisible : on reste sur process.cwd() */ }

const at = p => resolve(cwd, p)
const notes = []

const parse = v => String(v).replace(/^v/, '').split('.').map(Number)

/**
 * Évalue un range `engines.node` limité aux formes réellement utilisées ici :
 * `^x.y.z` et `>=x.y.z`, jointes par `||`. Suffisant pour ce champ, et
 * volontairement pas un parseur semver complet.
 */
function satisfies(version, range) {
  const [maj, min, pat] = parse(version)
  return range.split('||').map(s => s.trim()).some((clause) => {
    const caret = clause.match(/^\^(\d+)\.(\d+)\.(\d+)$/)
    if (caret) {
      const [, a, b, c] = caret.map(Number)
      if (maj !== a) return false
      return min > b || (min === b && pat >= c)
    }
    const gte = clause.match(/^>=\s*(\d+)\.(\d+)\.(\d+)$/)
    if (gte) {
      const [, a, b, c] = gte.map(Number)
      return maj > a || (maj === a && (min > b || (min === b && pat >= c)))
    }
    return false // clause non gérée : on ne prétend pas savoir
  })
}

// --- Node
try {
  const pkg = JSON.parse(readFileSync(at('package.json'), 'utf8'))
  const required = pkg.engines?.node
  if (required && !satisfies(process.version, required)) {
    const major = parse(process.version)[0]
    // Deux causes distinctes, deux messages : une version impaire n'est pas LTS
    // et n'est supportée par personne ; une LTS paire hors plage est simplement
    // un décalage avec le runtime de production.
    const cause = major % 2 === 1
      ? `Les versions impaires (23, 25) ne sont pas LTS et ne sont supportées ni par Nuxt ni par ce projet.`
      : `C'est une LTS, mais ce projet tient un seul runtime, celui de la production.`
    notes.push(
      `Node ${process.version} est HORS de la plage attendue (\`${required}\`). ${cause} `
      + `Lance \`nvm use\` (un .nvmrc est fourni) avant tout npm/nuxt.`,
    )
  }
}
catch { /* package.json absent ou illisible */ }

// --- npm
try {
  const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8', timeout: 10_000 }).trim()
  if (parse(npmVersion)[0] < 11) {
    notes.push(
      `npm ${npmVersion} : \`npm install\` échoue sur ce projet avec `
      + `« Cannot read properties of null (reading 'edgesOut') » (bug arborist). `
      + `npm >= 11 est requis : \`npm i -g npm@11\`.`,
    )
  }
}
catch { /* npm introuvable */ }

// --- Arbre de dépendances et artefacts générés
if (!existsSync(at('node_modules'))) {
  notes.push('`node_modules/` absent — lance `nvm use && npm install` avant toute autre commande.')
}
else if (!existsSync(at('.nuxt'))) {
  notes.push('`.nuxt/` absent — `npm run typecheck` et ESLint ne fonctionneront pas. Lance `npx nuxt prepare`.')
}

// --- Secret SMTP (présence uniquement, jamais la valeur)
if (existsSync(at('.env'))) {
  const hasPass = /^\s*(NUXT_)?SMTP_PASS\s*=\s*\S/m.test(readFileSync(at('.env'), 'utf8'))
  if (!hasPass) {
    notes.push('`.env` existe mais NUXT_SMTP_PASS n\'y est pas renseigné — `/api/contact` répondra 503.')
  }
}
else {
  notes.push('`.env` absent — copie `.env.example` et renseigne NUXT_SMTP_PASS, sinon `/api/contact` répondra 503.')
}

// --- Branche git
try {
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd, encoding: 'utf8', timeout: 10_000,
  }).trim()
  if (branch === 'main' || branch === 'master') {
    notes.push(`Tu es sur \`${branch}\`. Crée une branche avant de committer.`)
  }
}
catch { /* pas un dépôt git */ }

if (!notes.length) process.exit(0)

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `Diagnostic de l'environnement (session-doctor) :\n${notes.map(n => `- ${n}`).join('\n')}`,
  },
}))
