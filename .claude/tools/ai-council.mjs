#!/usr/bin/env node
/**
 * ai-council — interroge plusieurs fournisseurs de LLM en parallèle sur une
 * même question, et rend leurs réponses côte à côte.
 *
 * POURQUOI EN HTTP BRUT, SANS SDK
 * Les SDK officiels (@anthropic-ai/sdk, openai, @google/genai) ajouteraient
 * ~4 dépendances lourdes à un dépôt qu'on vient de ramener à 0 vulnérabilité
 * pour 846 paquets. Trois formes de requête suffisent ici, et `fetch` est natif
 * depuis Node 18. Ce fichier est délibérément neutre vis-à-vis des fournisseurs :
 * ne pas y introduire de SDK propriétaire.
 *
 * FOURNISSEURS
 *   anthropic   ANTHROPIC_API_KEY     API Messages native
 *   gemini      GEMINI_API_KEY | GOOGLE_API_KEY   generateContent
 *   openai      OPENAI_API_KEY        /chat/completions
 *   xai         XAI_API_KEY           /chat/completions (compatible OpenAI)
 *   openrouter  OPENROUTER_API_KEY    /chat/completions (passerelle multi-modèles)
 *   ollama      OLLAMA_HOST           /chat/completions (local, sans clé)
 *
 * Un fournisseur sans identifiant est simplement ignoré : la commande
 * fonctionne avec un seul fournisseur configuré.
 *
 * MODÈLES
 * Les identifiants de modèles changent vite. Plutôt que de figer des valeurs
 * qui périmeront, le script les *découvre* via l'endpoint /models de chaque
 * fournisseur et choisit le plus capable selon un classement par famille.
 * Priorité : $COUNCIL_<PROV>_MODEL > cache (24 h) > découverte > repli codé.
 *
 * USAGE
 *   node .claude/tools/ai-council.mjs --prompt "question"
 *   git diff | node .claude/tools/ai-council.mjs --stdin --preset review
 *   node .claude/tools/ai-council.mjs --file rapport.md --preset security
 *   node .claude/tools/ai-council.mjs --providers gemini,openai --prompt "..."
 *   node .claude/tools/ai-council.mjs --list      # modèles réellement servis
 *   node .claude/tools/ai-council.mjs --status    # ce qui est configuré
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '../..')
const CACHE_PATH = resolve(HERE, '.model-cache.json')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const DEFAULT_TIMEOUT_MS = 180_000

// ---------------------------------------------------------------- fournisseurs

/**
 * `rank` classe les identifiants renvoyés par /models. Le score combine le
 * numéro de version détecté, un bonus pour les familles haut de gamme et une
 * pénalité pour les variantes légères ou non conversationnelles.
 */
const PROVIDERS = {
  anthropic: {
    label: 'Claude (Anthropic)',
    keyEnv: ['ANTHROPIC_API_KEY'],
    shape: 'anthropic',
    base: 'https://api.anthropic.com/v1',
    fallbackModel: 'claude-opus-5',
    prefer: [/opus/, /sonnet/],
    avoid: [/haiku/],
  },
  gemini: {
    label: 'Gemini (Google)',
    keyEnv: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
    shape: 'gemini',
    base: 'https://generativelanguage.googleapis.com/v1beta',
    fallbackModel: 'gemini-2.5-pro',
    prefer: [/pro/],
    avoid: [/flash/, /lite/, /embedding/, /aqa/, /vision/, /tts/, /image/, /live/, /learnlm/, /gemma/],
  },
  openai: {
    label: 'GPT (OpenAI)',
    keyEnv: ['OPENAI_API_KEY'],
    shape: 'openai',
    base: 'https://api.openai.com/v1',
    fallbackModel: 'gpt-5',
    prefer: [/^gpt-\d/, /^o\d/],
    avoid: [/mini/, /nano/, /audio/, /realtime/, /image/, /embedding/, /tts/, /whisper/, /moderation/,
      /instruct/, /transcribe/, /search/, /dall-e/, /davinci/, /babbage/, /codex/],
  },
  xai: {
    label: 'Grok (xAI)',
    keyEnv: ['XAI_API_KEY'],
    shape: 'openai',
    base: 'https://api.x.ai/v1',
    fallbackModel: 'grok-4',
    prefer: [/^grok-\d/],
    avoid: [/mini/, /fast/, /image/, /vision/],
  },
  openrouter: {
    label: 'OpenRouter (passerelle)',
    keyEnv: ['OPENROUTER_API_KEY'],
    shape: 'openai',
    base: 'https://openrouter.ai/api/v1',
    // Le catalogue OpenRouter compte des centaines d'entrées ; une découverte
    // automatique n'y a pas de sens. On exige un choix explicite.
    fallbackModel: 'anthropic/claude-opus-4.1',
    discover: false,
  },
  ollama: {
    label: 'Ollama (local)',
    keyEnv: [],
    shape: 'openai',
    base: (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/+$/, '') + '/v1',
    fallbackModel: 'llama3.1',
    localOnly: true,
  },
}

// -------------------------------------------------------------------- consignes

const PRESETS = {
  review: {
    system: 'Tu es un relecteur de code senior, sceptique et concis. Tu écris en français.',
    instruction: [
      'Relis le diff ci-dessous et signale uniquement les problèmes RÉELS.',
      '',
      'Pour chaque problème : fichier:ligne, ce qui casse, et un scénario concret de',
      'déclenchement (entrée -> comportement erroné). Classe par gravité décroissante.',
      '',
      'Ignore le style et les préférences de formatage. Si tu ne trouves rien de solide,',
      "dis-le franchement plutôt que d'inventer. N'invente jamais un numéro de ligne.",
    ].join('\n'),
  },
  security: {
    system: 'Tu es un pentesteur applicatif. Tu es précis, factuel et tu ne surestimes pas la gravité. Tu écris en français.',
    instruction: [
      'Analyse le code ci-dessous du point de vue de la sécurité offensive.',
      '',
      'Cherche : injection (SQL/commande/en-têtes), XSS, SSRF, contournement',
      "d'authentification ou d'autorisation, pollution de prototype, divulgation",
      'de secrets ou de traces, absence de limitation de débit, désérialisation',
      'non sûre, traversée de chemin.',
      '',
      "Pour chaque finding : la faille, le vecteur d'exploitation concret, la gravité",
      '(critique/haute/moyenne/basse) et le correctif minimal. Distingue clairement',
      'ce que tu as VÉRIFIÉ dans le code de ce que tu SUPPOSES.',
    ].join('\n'),
  },
  architecture: {
    system: 'Tu es un architecte logiciel pragmatique, allergique à la complexité inutile. Tu écris en français.',
    instruction: [
      'Évalue les choix de conception ci-dessous.',
      '',
      'Réponds à : quel problème réel cette approche crée-t-elle à 6 mois ?',
      'Quelle serait la solution plus simple qui marche aussi bien ?',
      'Quel est le point de rupture (charge, taille, nombre de contributeurs) ?',
      '',
      'Sois direct. Si la conception est saine, dis-le et arrête-toi là.',
    ].join('\n'),
  },
  raw: { system: null, instruction: null },
}

// --------------------------------------------------------------- contexte projet

/**
 * Charge les instructions projet à envoyer aux modèles externes.
 *
 * Sans ça, un modèle tiers relit le code sans savoir que Tailwind 4 a renommé
 * `bg-gradient-to-*` en `bg-linear-to-*`, ni que le code applicatif vit sous
 * `app/`, ni quels invariants de sécurité sont déjà en place. Il produit alors
 * des findings faux avec assurance — le mode d'échec le plus coûteux, parce
 * qu'il faut du travail pour les réfuter.
 *
 * AGENTS.md est la source de vérité inter-outils du dépôt ; SECURITY.md est
 * ajouté pour le preset `security` afin que les risques résiduels déjà assumés
 * ne soient pas re-signalés comme des découvertes.
 */
function loadProjectContext(preset) {
  const wanted = ['AGENTS.md', ...(preset === 'security' ? ['SECURITY.md'] : [])]
  const parts = []

  for (const name of wanted) {
    try {
      parts.push(`<${name}>\n${readFileSync(resolve(REPO_ROOT, name), 'utf8').trim()}\n</${name}>`)
    }
    catch { /* fichier absent : on continue sans */ }
  }

  if (!parts.length) return null

  return [
    'Voici les instructions et conventions du dépôt sur lequel porte la question.',
    'Elles sont autoritatives : ce qui y est décrit est un choix déjà tranché, pas',
    'un problème à signaler. En particulier, les classes Tailwind 4 qui y figurent',
    'sont valides — ne les signale pas comme inexistantes.',
    '',
    parts.join('\n\n'),
  ].join('\n')
}

// ------------------------------------------------------------------- arguments

function parseArgs(argv) {
  const out = { preset: 'raw', providers: null, timeout: DEFAULT_TIMEOUT_MS }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    if (a === '--prompt') out.prompt = next()
    else if (a === '--file') out.file = next()
    else if (a === '--stdin') out.stdin = true
    else if (a === '--preset') out.preset = next()
    else if (a === '--providers') out.providers = next().split(',').map(s => s.trim()).filter(Boolean)
    else if (a === '--timeout') out.timeout = Number(next()) * 1000
    else if (a === '--list') out.list = true
    else if (a === '--status') out.status = true
    else if (a === '--json') out.json = true
    else if (a === '--refresh-models') out.refresh = true
    else if (a === '--no-context') out.noContext = true
    else if (a === '-h' || a === '--help') out.help = true
    else if (!out.prompt) out.prompt = a
  }
  return out
}

function available(names) {
  const wanted = names ?? Object.keys(PROVIDERS)
  return wanted.filter((name) => {
    const p = PROVIDERS[name]
    if (!p) return false
    if (p.localOnly) return Boolean(process.env.OLLAMA_HOST)
    return p.keyEnv.some(e => process.env[e])
  })
}

const apiKey = p => p.keyEnv.map(e => process.env[e]).find(Boolean) ?? ''

/**
 * URL de base effective. Surchargeable par COUNCIL_<FOURNISSEUR>_BASE_URL pour
 * router via une passerelle d'entreprise, un proxy, Azure OpenAI ou un mock de
 * test, sans toucher au code.
 */
function baseUrl(name) {
  const override = process.env[`COUNCIL_${name.toUpperCase()}_BASE_URL`]
  return (override ? override.replace(/\/+$/, '') : PROVIDERS[name].base)
}

// -------------------------------------------------------------- cache modèles

function readCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  }
  catch {
    return {}
  }
}

function writeCache(cache) {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true })
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  }
  catch { /* cache best-effort : une écriture ratée n'est pas une erreur */ }
}

// ------------------------------------------------------------------ /models

async function listModels(name, signal) {
  const p = PROVIDERS[name]
  const key = apiKey(p)
  const base = baseUrl(name)

  if (p.shape === 'anthropic') {
    const res = await fetch(`${base}/models?limit=1000`, {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      signal,
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    return (await res.json()).data.map(m => m.id)
  }

  if (p.shape === 'gemini') {
    const res = await fetch(`${base}/models?pageSize=1000`, {
      headers: { 'x-goog-api-key': key },
      signal,
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    return (await res.json()).models
      .filter(m => (m.supportedGenerationMethods ?? []).includes('generateContent'))
      .map(m => m.name.replace(/^models\//, ''))
  }

  const res = await fetch(`${base}/models`, {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
    signal,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return (await res.json()).data.map(m => m.id)
}

/** Extrait le plus grand nombre à points de l'identifiant (4.1 > 4 > 3.5). */
function versionScore(id) {
  const nums = [...id.matchAll(/(\d+)(?:[.-](\d+))?/g)]
    .map(m => Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0))
  return nums.length ? Math.max(...nums) : 0
}

function pickBest(name, ids) {
  const p = PROVIDERS[name]
  const scored = ids
    .map((id) => {
      let score = versionScore(id)
      // `prefer` est ordonnée du plus au moins capable : le rang doit peser,
      // sinon `opus` et `sonnet` finissent à égalité et c'est l'ordre d'arrivée
      // de l'API qui tranche.
      const prefer = p.prefer ?? []
      const rank = prefer.findIndex(re => re.test(id))
      if (rank !== -1) score += (prefer.length - rank) * 1000
      if ((p.avoid ?? []).some(re => re.test(id))) score -= 100_000
      // Les instantanés datés sont plus stables mais moins lisibles : léger malus.
      if (/\d{8}$/.test(id) || /-\d{4}-\d{2}-\d{2}$/.test(id)) score -= 1
      return { id, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored[0] && scored[0].score > -1000 ? scored[0].id : null
}

async function resolveModel(name, { refresh = false } = {}) {
  const p = PROVIDERS[name]
  const override = process.env[`COUNCIL_${name.toUpperCase()}_MODEL`]
  if (override) return { model: override, source: 'env' }
  if (p.discover === false) return { model: p.fallbackModel, source: 'repli' }

  const cache = readCache()
  const hit = cache[name]
  if (!refresh && hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { model: hit.model, source: 'cache' }
  }

  try {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 20_000)
    const ids = await listModels(name, ac.signal)
    clearTimeout(timer)
    const best = pickBest(name, ids)
    if (best) {
      cache[name] = { model: best, at: Date.now() }
      writeCache(cache)
      return { model: best, source: 'découverte' }
    }
  }
  catch { /* découverte impossible : on retombe sur le repli */ }

  return { model: p.fallbackModel, source: 'repli' }
}

// ------------------------------------------------------------------- requête

async function ask(name, model, system, user, signal) {
  const p = PROVIDERS[name]
  const key = apiKey(p)
  const base = baseUrl(name)

  if (p.shape === 'anthropic') {
    const body = {
      model,
      max_tokens: 16000,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: user }],
      // Réflexion adaptative : `budget_tokens` est rejeté par les modèles
      // actuels (Opus 5 et suivants). L'effort élevé est le bon défaut pour
      // une relecture.
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
    }

    const send = payload => fetch(`${base}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    })

    let res = await send(body)
    if (res.status === 400) {
      // Un modèle plus ancien peut refuser `thinking` / `output_config`.
      // On réessaie une fois en version minimale avant d'abandonner.
      const minimal = { ...body }
      delete minimal.thinking
      delete minimal.output_config
      const retry = await send(minimal)
      if (retry.ok) res = retry
      else throw new Error(`${res.status} ${await res.text()}`)
    }
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)

    const json = await res.json()
    if (json.stop_reason === 'refusal') return '[le modèle a refusé de répondre]'
    return json.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
  }

  if (p.shape === 'gemini') {
    const res = await fetch(`${base}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 16000 },
      }),
      signal,
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    const json = await res.json()
    const cand = json.candidates?.[0]
    if (!cand) throw new Error(`aucun candidat renvoyé (${json.promptFeedback?.blockReason ?? 'raison inconnue'})`)
    return (cand.content?.parts ?? []).map(part => part.text).filter(Boolean).join('\n').trim()
      || `[réponse vide, finishReason=${cand.finishReason}]`
  }

  // Forme compatible OpenAI : openai, xai, openrouter, ollama.
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user },
      ],
    }),
    signal,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const json = await res.json()
  return (json.choices?.[0]?.message?.content ?? '').trim() || '[réponse vide]'
}

// ---------------------------------------------------------------------- main

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  process.stdout.write(readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n').slice(1).filter(l => l.startsWith(' *')).map(l => l.replace(/^ \*ic?/, '').replace(/^ \* ?/, '')).join('\n'))
  process.exit(0)
}

const active = available(args.providers)

if (args.status) {
  const rows = Object.entries(PROVIDERS).map(([name, p]) => {
    const on = active.includes(name)
    const via = p.localOnly ? 'OLLAMA_HOST' : (p.keyEnv.find(e => process.env[e]) ?? p.keyEnv.join(' | '))
    const override = process.env[`COUNCIL_${name.toUpperCase()}_MODEL`]
    return `  ${on ? '✓' : '·'} ${name.padEnd(11)} ${p.label.padEnd(24)} ${on ? `via ${via}` : `absent (définir ${via})`}`
      + (override ? `\n      modèle forcé : ${override}` : '')
  })
  process.stdout.write(`Fournisseurs ai-council :\n${rows.join('\n')}\n\n`
    + `${active.length} actif(s). Forcer un modèle : COUNCIL_<FOURNISSEUR>_MODEL=<id>\n`)
  process.exit(0)
}

if (!active.length) {
  process.stderr.write(
    'Aucun fournisseur configuré.\n\n'
    + 'Définis au moins une clé dans ton shell, puis relance :\n'
    + '  export ANTHROPIC_API_KEY=...     # Claude\n'
    + '  export GEMINI_API_KEY=...        # Gemini\n'
    + '  export OPENAI_API_KEY=...        # GPT\n'
    + '  export XAI_API_KEY=...           # Grok\n'
    + '  export OPENROUTER_API_KEY=...    # passerelle (un seul compte pour tous)\n'
    + '  export OLLAMA_HOST=http://127.0.0.1:11434   # local, sans clé\n\n'
    + 'Détail : node .claude/tools/ai-council.mjs --status\n',
  )
  process.exit(1)
}

if (args.list) {
  for (const name of active) {
    try {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), 20_000)
      const ids = await listModels(name, ac.signal)
      clearTimeout(timer)
      const best = pickBest(name, ids)
      process.stdout.write(`\n${PROVIDERS[name].label} — ${ids.length} modèle(s), retenu : ${best ?? 'aucun'}\n`)
      process.stdout.write(ids.sort().map(id => `  ${id === best ? '*' : ' '} ${id}`).join('\n') + '\n')
    }
    catch (error) {
      process.stdout.write(`\n${PROVIDERS[name].label} — échec du listing : ${error.message}\n`)
    }
  }
  process.exit(0)
}

// --- assemblage de la question
let payload = args.prompt ?? ''
if (args.file) payload = readFileSync(resolve(process.cwd(), args.file), 'utf8')
if (args.stdin) {
  let buf = ''
  for await (const chunk of process.stdin) buf += chunk
  payload = args.prompt ? `${args.prompt}\n\n${buf}` : buf
}

if (!payload.trim()) {
  process.stderr.write('Rien à demander. Utilise --prompt, --file ou --stdin.\n')
  process.exit(1)
}

const preset = PRESETS[args.preset]
if (!preset) {
  process.stderr.write(`Preset inconnu : ${args.preset}. Disponibles : ${Object.keys(PRESETS).join(', ')}\n`)
  process.exit(1)
}

const question = preset.instruction ? `${preset.instruction}\n\n---\n\n${payload}` : payload

// Le contexte projet va dans le message système : les trois formes d'API
// supportées (Anthropic, Gemini, compatible OpenAI) l'exposent toutes.
const projectContext = args.noContext ? null : loadProjectContext(args.preset)
const system = [preset.system, projectContext].filter(Boolean).join('\n\n') || null

// --- éventail parallèle
const results = await Promise.all(active.map(async (name) => {
  const started = Date.now()
  const { model, source } = await resolveModel(name, { refresh: args.refresh })
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), args.timeout)
  try {
    const answer = await ask(name, model, system, question, ac.signal)
    return { name, model, source, ms: Date.now() - started, answer }
  }
  catch (error) {
    const reason = ac.signal.aborted ? `délai dépassé (${args.timeout / 1000} s)` : error.message
    return { name, model, source, ms: Date.now() - started, error: String(reason).slice(0, 600) }
  }
  finally {
    clearTimeout(timer)
  }
}))

if (args.json) {
  process.stdout.write(JSON.stringify({ preset: args.preset, results }, null, 2) + '\n')
  process.exit(results.every(r => r.error) ? 1 : 0)
}

const ok = results.filter(r => !r.error)
const ko = results.filter(r => r.error)

process.stdout.write(`# Conseil multi-modèles — preset « ${args.preset} »\n\n`)
process.stdout.write(`${ok.length}/${results.length} fournisseur(s) ont répondu.\n`)
process.stdout.write(projectContext
  ? `Contexte projet transmis : ${(projectContext.length / 1024).toFixed(1)} Ko.\n\n`
  : `Contexte projet NON transmis — les findings seront moins fiables.\n\n`)

for (const r of results.sort((a, b) => a.name.localeCompare(b.name))) {
  process.stdout.write(`\n---\n\n## ${PROVIDERS[r.name].label}\n\n`)
  process.stdout.write(`\`${r.model}\` · modèle choisi par ${r.source} · ${(r.ms / 1000).toFixed(1)} s\n\n`)
  process.stdout.write(r.error ? `**ÉCHEC** — ${r.error}\n` : `${r.answer}\n`)
}

if (ko.length) {
  process.stdout.write(`\n---\n\n_${ko.length} fournisseur(s) en échec : ${ko.map(r => r.name).join(', ')}._\n`)
}

process.exit(ok.length ? 0 : 1)
