export default defineNuxtConfig({
  // Modules de base
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    '@vueuse/motion/nuxt',
    '@nuxtjs/robots', // Pour le robots.txt
    'nuxt-simple-sitemap', // Pour générer le sitemap
  ],

  // Configuration SEO et meta tags
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr'
      },
      title: 'Fabien Lubin - Développeur Full Stack',
      titleTemplate: '%s | Fabien Lubin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Portfolio de Fabien Lubin, développeur Full Stack passionné par la création d\'expériences web modernes et innovantes.'
        },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Fabien Lubin - Développeur Full Stack' },
        { property: 'og:description', content: 'Portfolio de Fabien Lubin, développeur Full Stack passionné par la création d\'expériences web modernes et innovantes.' },
        { property: 'og:image', content: '/og-image.jpg' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Fabien Lubin - Développeur Full Stack' },
        { name: 'twitter:description', content: 'Portfolio de Fabien Lubin, développeur Full Stack passionné par la création d\'expériences web modernes et innovantes.' },
        { name: 'twitter:image', content: '/og-image.jpg' },
        // Autres meta tags importants
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#4F46E5' }
      ],
      link: [
        // Favicons
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        // Manifest
        { rel: 'manifest', href: '/favicon/site.webmanifest' }
      ]
    }
  },

  // Configuration du sitemap
  sitemap: {
    siteUrl: 'https://fabienlubin.fr',
  },

  // Configuration des robots
  robots: {
    rules: [
      {
        UserAgent: '*',
        Allow: '/',
        Disallow: [
          '/dist/',
          '/node_modules/',
          '/.git/',
          '/.github/',
          '/.nuxt/',
          '/.env',
          '/.gitignore'
        ]
      }
    ],
    sitemap: 'https://fabienlubin.fr/sitemap.xml'
  },

  // Variables d'environnement publiques
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://fabienlubin.fr'
    }
  },

  // Date de compatibilité
  compatibilityDate: '2025-02-08'
})