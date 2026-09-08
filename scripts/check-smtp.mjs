#!/usr/bin/env node
/**
 * Diagnostic de la configuration SMTP du formulaire de contact.
 *
 * Deux étapes, volontairement séparées :
 *
 *   node scripts/check-smtp.mjs          vérifie la connexion et l'authentification,
 *                                        SANS envoyer de message
 *   node scripts/check-smtp.mjs --send   envoie UN message de test
 *
 * L'ordre compte : si les identifiants sont faux, une tentative d'envoi
 * n'apprend rien de plus qu'un échec d'authentification, et une rafale
 * d'échecs d'auth sur un compte OVH peut déclencher un blocage temporaire.
 *
 * Ce script n'affiche jamais la valeur d'un secret : seulement le nom des clés
 * et leur présence.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Charge `.env` sans dépendance : le format utilisé ici est `CLE=valeur`. */
function loadEnv() {
  const out = {}
  let raw
  try {
    raw = readFileSync(resolve(ROOT, '.env'), 'utf8')
  }
  catch {
    return out
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  }
  return out
}

const env = { ...loadEnv(), ...process.env }

// Mêmes valeurs par défaut que `runtimeConfig.smtp` dans nuxt.config.ts.
const config = {
  host: env.NUXT_SMTP_HOST || 'ssl0.ovh.net',
  port: Number(env.NUXT_SMTP_PORT || '587'),
  user: env.NUXT_SMTP_USER || 'bonjour@fabienlubin.fr',
  // Rétro-compatibilité avec l'ancien nom de variable.
  pass: env.NUXT_SMTP_PASS || env.SMTP_PASS || '',
  to: env.NUXT_SMTP_TO || 'bonjour@fabienlubin.fr',
}

console.log('Configuration résolue')
console.log(`  host  ${config.host}`)
console.log(`  port  ${config.port}`)
console.log(`  user  ${config.user}`)
console.log(`  to    ${config.to}`)
console.log(`  pass  ${config.pass ? `renseigné (${config.pass.length} caractères)` : 'ABSENT'}`)

const declared = ['NUXT_SMTP_HOST', 'NUXT_SMTP_PORT', 'NUXT_SMTP_USER', 'NUXT_SMTP_PASS', 'NUXT_SMTP_TO', 'SMTP_PASS']
console.log('\nClés présentes dans l\'environnement')
for (const key of declared) {
  console.log(`  ${key.padEnd(16)} ${env[key] ? 'définie' : '—'}`)
}

if (!config.pass) {
  console.error('\nAucun mot de passe : renseigner NUXT_SMTP_PASS dans .env.')
  process.exit(2)
}

// Options identiques à celles de server/api/contact.post.ts, pour que le
// diagnostic teste bien ce que fait la production.
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.port === 465,
  requireTLS: config.port !== 465,
  tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  auth: { user: config.user, pass: config.pass },
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
})

console.log('\nVérification de la connexion et de l\'authentification…')
try {
  await transporter.verify()
  console.log('  OK — le serveur accepte ces identifiants.')
}
catch (error) {
  console.error(`  ÉCHEC — ${error.message}`)
  if (error.code) console.error(`  code : ${error.code}`)
  if (error.responseCode) console.error(`  réponse SMTP : ${error.responseCode}`)
  console.error('\n  535 / EAUTH  identifiants refusés : vérifier que le compte SMTP')
  console.error('               correspond bien à la boîte et que le mot de passe est celui')
  console.error('               du compte de messagerie, pas celui du manager OVH.')
  console.error('  ETIMEDOUT    port filtré en sortie, ou hôte erroné.')
  console.error('  ESOCKET      échec TLS : vérifier le port (587 STARTTLS, 465 TLS direct).')
  transporter.close()
  process.exit(1)
}

if (!process.argv.includes('--send')) {
  console.log('\nAucun message envoyé. Relancer avec --send pour un test réel.')
  transporter.close()
  process.exit(0)
}

const stamp = new Date().toLocaleString('fr-FR')
console.log(`\nEnvoi d'un message de test vers ${config.to}…`)
try {
  const info = await transporter.sendMail({
    from: { name: 'Test formulaire fabienlubin.fr', address: config.user },
    to: config.to,
    replyTo: config.user,
    subject: `Test du formulaire de contact — ${stamp}`,
    text: [
      'Message de test émis par scripts/check-smtp.mjs.',
      '',
      `Horodatage : ${stamp}`,
      `Compte SMTP : ${config.user}`,
      `Hôte : ${config.host}:${config.port}`,
      '',
      'Si vous lisez ce message, la chaîne SMTP du formulaire de contact',
      'fonctionne de bout en bout.',
    ].join('\n'),
  })
  console.log('  OK — accepté par le serveur.')
  console.log(`  messageId : ${info.messageId}`)
  if (info.accepted?.length) console.log(`  accepté pour : ${info.accepted.join(', ')}`)
  if (info.rejected?.length) console.log(`  REJETÉ pour  : ${info.rejected.join(', ')}`)
  if (info.response) console.log(`  réponse : ${info.response}`)
  console.log('\n  « Accepté » signifie que le relais a pris le message en charge.')
  console.log('  Seule la réception dans la boîte confirme la livraison.')
}
catch (error) {
  console.error(`  ÉCHEC — ${error.message}`)
  if (error.responseCode) console.error(`  réponse SMTP : ${error.responseCode}`)
  transporter.close()
  process.exit(1)
}

transporter.close()
