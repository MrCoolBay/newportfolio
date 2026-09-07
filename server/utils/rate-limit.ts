/**
 * Limiteur de débit à fenêtre fixe, en mémoire.
 *
 * Limite : l'état est local au processus. Derrière plusieurs instances/lambdas,
 * chaque instance applique sa propre fenêtre. Pour un déploiement multi-instance,
 * remplacer le `Map` par un store partagé (Redis / Nitro storage).
 */
type Bucket = { count: number, resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_TRACKED_KEYS = 10_000

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  // Purge opportuniste : évite une croissance illimitée du Map (DoS mémoire).
  if (buckets.size >= MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k)
    }
    // Toujours saturé : la fenêtre courante est entièrement pleine, on refuse.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      return { allowed: false, remaining: 0, retryAfter: Math.ceil(windowMs / 1000) }
    }
  }

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }

  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 }
}
