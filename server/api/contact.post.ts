import type { Transporter } from 'nodemailer'
import type { H3Event } from 'h3'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { rateLimit } from '../utils/rate-limit'

/** Corps de requête maximal accepté — le formulaire tient très largement dedans. */
const MAX_BODY_BYTES = 16 * 1024

/** Fenêtre par IP : 3 tentatives / 10 min (toute tentative compte, valide ou non). */
const PER_IP_LIMIT = 3
const PER_IP_WINDOW_MS = 10 * 60 * 1000

/**
 * Garde-fou global, compté uniquement sur les envois réels : borne le volume de
 * mails même si l'attaquant fait varier `X-Forwarded-For` (en-tête falsifiable).
 */
const GLOBAL_LIMIT = 30
const GLOBAL_WINDOW_MS = 60 * 60 * 1000

/**
 * Interdit CR / LF / NUL dans les champs réinjectés dans un en-tête SMTP
 * (`Reply-To`) : bloque l'injection d'en-têtes et de destinataires cachés.
 */
const NO_HEADER_INJECTION = /^[^\r\n\0]*$/

const contactSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(60).regex(NO_HEADER_INJECTION),
  lastName: z.string().trim().min(1).max(60).regex(NO_HEADER_INJECTION),
  email: z.string().trim().toLowerCase().max(254).regex(NO_HEADER_INJECTION).pipe(z.email()),
  message: z.string().trim().min(10).max(5000),
  /**
   * Champ piège, masqué côté client. Accepté par le schéma (borné) pour
   * pouvoir répondre un faux succès plutôt qu'un 400 : un bot qui reçoit une
   * erreur apprend que le champ est surveillé et ajuste son payload.
   */
  website: z.string().max(200).optional(),
})

let transporter: Transporter | undefined

type SmtpConfig = {
  host: string
  port: string
  user: string
  pass: string
  to: string
}

function getTransporter(smtp: SmtpConfig): Transporter {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    // Port 587 : connexion en clair puis STARTTLS. `requireTLS` rend le
    // passage en TLS obligatoire — sans lui, un MITM peut supprimer l'annonce
    // STARTTLS et récupérer les identifiants SMTP en clair.
    secure: Number(smtp.port) === 465,
    requireTLS: Number(smtp.port) !== 465,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    // Un handler HTTP ne doit jamais rester bloqué sur un socket SMTP muet.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
  })

  return transporter
}

/**
 * Contrôle anti-abus (pas une frontière de sécurité : il n'y a ni session ni
 * action authentifiée à protéger). Il coûte cher aux bots naïfs et aux
 * formulaires rejoués depuis un autre domaine, sans rien casser en local.
 */
function isAllowedOrigin(event: H3Event, origin: string, siteUrl: string): boolean {
  let originHost: string
  try {
    originHost = new URL(origin).host
  }
  catch {
    return false
  }

  const allowed = new Set<string>()
  try {
    allowed.add(new URL(siteUrl).host)
  }
  catch { /* siteUrl mal formée : on retombe sur l'hôte de la requête */ }

  const requestHost = getRequestHost(event)
  if (requestHost) allowed.add(requestHost)

  return allowed.has(originHost)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // Rétro-compatibilité : la variable s'appelait `SMTP_PASS` avant la migration.
  // Lue au runtime (jamais figée dans le build) pour ne pas casser un
  // déploiement qui n'a pas encore été renommé en `NUXT_SMTP_PASS`.
  const configured = config.smtp as SmtpConfig
  const smtp: SmtpConfig = {
    ...configured,
    pass: configured.pass || process.env.SMTP_PASS || '',
  }

  // 1. Le formulaire n'envoie que du JSON : tout le reste est rejeté d'emblée.
  const contentType = getRequestHeader(event, 'content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported Media Type' })
  }

  // 2. Refus avant lecture du corps : évite de bufferiser un payload géant.
  const contentLength = Number.parseInt(getRequestHeader(event, 'content-length') ?? '0', 10)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
  }

  // 3. Origine.
  const origin = getRequestHeader(event, 'origin')
  if (origin && !isAllowedOrigin(event, origin, config.public.siteUrl)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 4. Débit par IP, avant tout travail coûteux.
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const perIp = rateLimit(`contact:ip:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS)
  if (!perIp.allowed) {
    setResponseHeader(event, 'Retry-After', perIp.retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Trop de messages envoyés. Merci de réessayer plus tard.',
    })
  }

  // 5. Validation stricte (clés inconnues refusées, longueurs bornées).
  const parsed = contactSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Formulaire invalide.',
      // Chemins de champs uniquement : aucune donnée soumise n'est renvoyée.
      data: { fields: parsed.error.issues.map(issue => issue.path.join('.')) },
    })
  }

  const { firstName, lastName, email, message, website } = parsed.data

  // 6. Piège à bots : on renvoie un succès factice pour ne rien leur apprendre.
  if (website) {
    return { success: true }
  }

  // 7. Configuration incomplète : erreur serveur explicite dans les logs,
  //    message neutre pour le client.
  if (!smtp.host || !smtp.user || !smtp.pass || !smtp.to) {
    console.error('[contact] Configuration SMTP incomplète (NUXT_SMTP_* manquants)')
    throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', message: 'Service indisponible.' })
  }

  const globalQuota = rateLimit('contact:global', GLOBAL_LIMIT, GLOBAL_WINDOW_MS)
  if (!globalQuota.allowed) {
    setResponseHeader(event, 'Retry-After', globalQuota.retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Trop de messages envoyés. Merci de réessayer plus tard.',
    })
  }

  const text = [
    'Nouvelle demande de contact',
    '',
    `Nom     : ${lastName} ${firstName}`,
    `Email   : ${email}`,
    `IP      : ${ip}`,
    '',
    'Message :',
    message,
  ].join('\n')

  try {
    await getTransporter(smtp).sendMail({
      from: { name: 'Portfolio Contact', address: smtp.user },
      to: smtp.to,
      subject: 'Nouvelle demande de contact',
      // Texte brut uniquement : aucun HTML construit à partir de l'entrée
      // utilisateur, donc aucune injection possible dans le client mail.
      text,
      replyTo: email,
    })
  }
  catch (error) {
    // Le détail reste dans les logs serveur : un message SMTP brut peut
    // révéler l'hôte, le compte ou la politique du relais.
    console.error('[contact] Envoi SMTP échoué:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: 'L\'envoi a échoué. Merci de réessayer plus tard.',
    })
  }

  return { success: true }
})
