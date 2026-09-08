<template>
  <LoadingScreen v-if="!hasVisited" />
  <div class="relative min-h-screen overflow-hidden bg-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const route = useRoute()
const { siteUrl } = useRuntimeConfig().public

/**
 * Canonical calculée par route.
 *
 * Elle était auparavant posée en dur dans `nuxt.config.ts`, donc identique sur
 * toutes les pages : chacune déclarait l'accueil comme sa version canonique,
 * ce qui invite les moteurs à désindexer /about, /projects et /contact.
 */
const canonical = computed(() => {
  const path = route.path === '/' ? '/' : route.path.replace(/\/+$/, '')
  return `${siteUrl}${path}`
})

useHead({
  htmlAttrs: { lang: 'fr-FR' },
  link: [
    { rel: 'canonical', href: canonical },
    // Site monolingue : `x-default` évite que les moteurs supposent
    // l'existence de variantes traduites.
    { rel: 'alternate', hreflang: 'fr-FR', href: canonical },
    { rel: 'alternate', hreflang: 'x-default', href: canonical },
  ],
  meta: [
    { property: 'og:url', content: canonical },
  ],
})

/**
 * Graphe schema.org global.
 *
 * Il sert deux publics : les moteurs classiques, pour les résultats enrichis
 * et le référencement local ; et les moteurs génératifs, qui consomment
 * massivement le JSON-LD parce que c'est la seule partie d'une page dont la
 * sémantique est explicite.
 *
 * Aucune adresse postale n'y figure : le siège est une adresse personnelle. Le
 * signal géographique passe par `areaServed`, qui est précisément ce que les
 * moteurs attendent d'un prestataire de services.
 */
useSchemaOrg([
  definePerson({
    name: 'Fabien Lubin',
    jobTitle: 'Développeur full-stack',
    description:
      'Développeur full-stack spécialisé Vue.js / Nuxt et FastAPI, également en '
      + 'mobile React Native. Alternant en cyberdéfense et freelance à Reims.',
    image: `${siteUrl}/og-image.png`,
    url: siteUrl,
    email: 'contact@fabienlubin.fr',
    knowsLanguage: ['fr-FR', 'en'],
    knowsAbout: [
      'Vue.js', 'Nuxt', 'TypeScript', 'React Native', 'Node.js',
      'Python', 'FastAPI', 'PHP', 'Docker', 'Intégration continue',
      'Cybersécurité applicative', 'Développement web', 'Développement mobile',
    ],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      'name': 'ESGI — École supérieure de génie informatique',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Reims',
        'addressCountry': 'FR',
      },
    },
    sameAs: [
      'https://github.com/MrCoolBay',
      'https://www.linkedin.com/in/fabien-lubin-695344291/',
    ],
  }),

  defineWebSite({
    name: 'Fabien Lubin — Développeur full-stack freelance',
    description:
      'Portfolio et vitrine freelance : sites vitrines, applications web et '
      + 'mobiles, API. Reims et Grand Est, missions à distance.',
    inLanguage: 'fr-FR',
  }),

  /**
   * L'activité est déclarée sur un `@id` distinct.
   *
   * Sans lui, le module fusionne Person et LocalBusiness en une identité
   * unique : le nœud sort typé `Organization` tout en portant `jobTitle` et
   * `alumniOf`, propriétés réservées à `Person` par schema.org. Le graphe
   * devenait invalide et l'entité personne disparaissait — précisément celle
   * qui compte sur un portfolio-CV.
   *
   * L'entrepreneur individuel et la personne sont juridiquement la même
   * entité ; `founder` exprime ce lien sans les confondre.
   */
  defineLocalBusiness({
    '@id': `${siteUrl}/#business`,
    '@type': 'ProfessionalService',
    'name': 'Fabien Lubin — Entrepreneur individuel',
    'founder': { '@id': `${siteUrl}/#identity` },
    'description':
      'Développement de sites vitrines, d\'applications web et mobiles et d\'API. '
      + 'Conteneurisation, intégration continue et durcissement applicatif.',
    'url': siteUrl,
    'email': 'contact@fabienlubin.fr',
    'image': `${siteUrl}/og-image.png`,
    'priceRange': 'Sur devis',
    'identifier': { '@type': 'PropertyValue', 'name': 'SIREN', 'value': '988265195' },
    'foundingDate': '2025-06-19',
    'areaServed': [
      { '@type': 'City', 'name': 'Reims' },
      { '@type': 'AdministrativeArea', 'name': 'Grand Est' },
      { '@type': 'Country', 'name': 'France' },
    ],
    'availableLanguage': ['fr-FR', 'en'],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Prestations',
      'itemListElement': [
        'Création de site vitrine',
        'Développement d\'application mobile iOS et Android',
        'Développement d\'application web et d\'API',
        'Sécurisation et mise en production',
      ].map(name => ({
        '@type': 'Offer',
        'itemOffered': { '@type': 'Service', 'name': name },
      })),
    },
  }),
])

// État du loader de première visite
const hasVisited = ref(false)

onMounted(() => {
  if (localStorage.getItem('hasVisited')) {
    hasVisited.value = true
    return
  }
  // Aligné sur le budget réel de l'animation (~1,2 s) plus une marge.
  setTimeout(() => {
    localStorage.setItem('hasVisited', 'true')
    hasVisited.value = true
  }, 1400)
})
</script>

<style>
/*
 * Pile de polices système. L'ancienne déclaration réclamait « Space Grotesk »,
 * une police qui n'était chargée nulle part : le navigateur retombait
 * silencieusement sur sa sans-serif par défaut. Nommer la pile réelle évite un
 * aller-retour de résolution et supprime tout risque de décalage de mise en
 * page au chargement.
 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* Animations de page */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Le mouvement de page est décoratif : le neutraliser si l'utilisateur le demande. */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
