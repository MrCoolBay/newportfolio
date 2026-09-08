/**
 * Résumé public du profil GitHub, servi par notre propre serveur.
 *
 * POURQUOI UN PROXY ET PAS UN WIDGET TIERS
 * Les cartes toutes faites (github-readme-stats, ghchart…) sont des images
 * distantes : elles violeraient la CSP du site (`img-src 'self' data:`) et
 * feraient dépendre l'affichage d'un service qu'on ne maîtrise pas. Ici le
 * navigateur ne parle qu'à notre origine.
 *
 * POURQUOI DU CACHE
 * L'API GitHub non authentifiée plafonne à 60 requêtes/heure et par IP. Sans
 * cache, une poignée de visiteurs suffit à épuiser le quota et le panneau
 * disparaît. Le cache est côté serveur : la `routeRule` `/api/**` impose
 * `no-store` au navigateur, ce qui n'entre pas en conflit.
 */
const GITHUB_USER = 'MrCoolBay'
const TIMEOUT_MS = 8_000
const MAX_REPOS = 4

type GitHubRepo = {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
  pushed_at: string
}

type GitHubUser = {
  login: string
  public_repos: number
  followers: number
  created_at: string
}

export type GitHubSummary = {
  login: string
  url: string
  repos: number
  followers: number
  since: string
  languages: string[]
  topRepos: Array<{
    name: string
    description: string
    url: string
    language: string | null
    stars: number
  }>
}

async function github<T>(path: string): Promise<T> {
  return await $fetch<T>(`https://api.github.com${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      // GitHub exige un User-Agent et recommande d'épingler la version d'API.
      'User-Agent': 'fabienlubin.fr',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

export default defineCachedEventHandler(async (): Promise<GitHubSummary | null> => {
  try {
    const [user, repos] = await Promise.all([
      github<GitHubUser>(`/users/${GITHUB_USER}`),
      github<GitHubRepo[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`),
    ])

    // Les forks et les dépôts archivés ne disent rien du travail en cours.
    const own = repos.filter(repo => !repo.fork && !repo.archived)

    const languages = [...new Set(own.map(repo => repo.language).filter((l): l is string => Boolean(l)))]

    const topRepos = [...own]
      .sort((a, b) => b.stargazers_count - a.stargazers_count
        || Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .slice(0, MAX_REPOS)
      .map(repo => ({
        name: repo.name,
        // Borné : une description de dépôt est libre et peut être longue.
        description: (repo.description ?? '').slice(0, 160),
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
      }))

    return {
      login: user.login,
      url: `https://github.com/${user.login}`,
      repos: user.public_repos,
      followers: user.followers,
      since: new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      languages,
      topRepos,
    }
  }
  catch (error) {
    // Quota épuisé, panne GitHub, réseau coupé : le panneau se masque côté
    // client plutôt que de casser la page. Le détail reste dans les logs.
    console.error('[github] Résumé indisponible:', error instanceof Error ? error.message : error)
    return null
  }
}, {
  name: 'github-summary',
  maxAge: 60 * 60,
  // Sert la version périmée pendant la régénération : un visiteur ne voit
  // jamais le panneau disparaître à l'expiration du cache.
  staleMaxAge: 60 * 60 * 24,
  swr: true,
})
