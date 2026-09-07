/**
 * Retire l'en-tête `x-powered-by: Nuxt` ajouté par le renderer SSR.
 *
 * Divulgation d'information de faible gravité : elle indique la stack exacte à
 * un scanner et permet de cibler les CVE correspondantes sans sonder le site.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    if (response.headers) delete response.headers['x-powered-by']
  })
})
