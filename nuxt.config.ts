import tailwindcss from '@tailwindcss/vite'

// L'apex `fabienlubin.fr` redirige en 308 vers `www`. C'est donc `www` qui est
// l'origine réellement servie : canonical, sitemap, robots et balises Open
// Graph doivent tous la désigner, sinon chaque signal transite par une
// redirection et se dilue.
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.fabienlubin.fr'

/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 *
 * CSP : le script inline de Nuxt (payload SSR) et les styles inline générés par
 * Vue / @vueuse/motion imposent 'unsafe-inline'. Aucune ressource tierce n'est
 * chargée (les icônes sont bundlées localement, cf. `icon.fallbackToApi: false`),
 * donc la directive reste restreinte à 'self'.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-DNS-Prefetch-Control': 'off',
  'X-Permitted-Cross-Domain-Policies': 'none',
}

export default defineNuxtConfig({
  compatibilityDate: '2026-09-08',

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@vueuse/motion/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // Source unique de vérité pour robots/sitemap (nuxt-site-config)
  site: {
    url: SITE_URL,
    name: 'Fabien Lubin — Développeur full-stack freelance',
  },

  runtimeConfig: {
    /**
     * Clés serveur uniquement — absentes du bundle client.
     * Surchargeables au runtime par NUXT_SMTP_HOST, NUXT_SMTP_PORT, etc.
     * `pass` reste volontairement vide ici : une valeur par défaut lue depuis
     * process.env serait figée dans le build et donc écrite sur disque.
     */
    smtp: {
      host: 'ssl0.ovh.net',
      port: '587',
      user: 'bonjour@fabienlubin.fr',
      pass: '',
      to: 'bonjour@fabienlubin.fr',
    },
    public: {
      siteUrl: SITE_URL,
    },
  },

  routeRules: {
    '/**': { headers: SECURITY_HEADERS },
    // L'API ne doit jamais être mise en cache ni indexée.
    '/api/**': {
      headers: {
        ...SECURITY_HEADERS,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  },

  icon: {
    mode: 'svg',
    // Bundle local exhaustif : aucune requête vers api.iconify.design.
    fallbackToApi: false,
    serverBundle: {
      collections: ['logos', 'mdi', 'simple-icons', 'heroicons'],
    },
    clientBundle: {
      scan: true,
    },
  },

  /**
   * Les crawlers d'IA sont explicitement autorisés — c'est un choix, pas un
   * oubli. Se faire citer par un moteur génératif suppose d'être lu par lui, et
   * `Google-Extended` conditionne l'usage du contenu par les AI Overviews. Pour
   * une vitrine freelance, la visibilité vaut plus que la rétention du contenu.
   *
   * Le groupe est déclaré nommément plutôt que laissé au joker, afin que la
   * décision reste lisible pour le prochain qui ouvre ce fichier.
   */
  robots: {
    groups: [
      {
        userAgent: ['*'],
        allow: ['/'],
        disallow: ['/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'meta-externalagent',
          'Bytespider',
          'CCBot',
          'MistralAI-User',
        ],
        allow: ['/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: ['/sitemap.xml'],
  },

  sitemap: {
    // La page légale porte un `noindex` : l'exclure du sitemap évite
    // d'envoyer aux moteurs une URL qu'on leur demande d'ignorer.
    exclude: ['/api/**', '/mentions-legales'],
    autoLastmod: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Fabien Lubin — Développeur full-stack freelance',
      titleTemplate: '%s | Fabien Lubin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Fabien Lubin, développeur full-stack freelance à Reims. Sites vitrines, applications web, API et applications mobiles iOS / Android en Vue.js / Nuxt, FastAPI et React Native.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:title', content: 'Fabien Lubin — Développeur full-stack freelance' },
        { property: 'og:description', content: 'Fabien Lubin, développeur full-stack freelance à Reims. Sites vitrines, applications web, API et applications mobiles iOS / Android en Vue.js / Nuxt, FastAPI et React Native.' },
        { property: 'og:image', content: `${SITE_URL}/og-image.png` },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Fabien Lubin — développeur full-stack freelance à Reims' },
        { property: 'og:site_name', content: 'Fabien Lubin' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Fabien Lubin — Développeur full-stack freelance' },
        { name: 'twitter:description', content: 'Fabien Lubin, développeur full-stack freelance à Reims. Sites vitrines, applications web, API et applications mobiles iOS / Android en Vue.js / Nuxt, FastAPI et React Native.' },
        { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
        { name: 'twitter:image:alt', content: 'Fabien Lubin — développeur full-stack freelance à Reims' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#18181b' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ],
    },
  },
})
