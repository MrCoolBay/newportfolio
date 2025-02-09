<template>
  <section class="mb-20 relative">
    <!-- En-tête de section -->
    <div class="mb-16 max-w-6xl mx-auto px-4">
      <div class="flex items-baseline gap-4">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tech Stack
        </h2>
        <div class="font-mono text-gray-400 text-sm">
          <span class="text-pink-600">import</span> * <span class="text-pink-600">from</span> <span class="text-green-600">'./skills'</span>
        </div>
      </div>
      <div class="mt-2 h-px w-full bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
    </div>

    <!-- Grille des technologies -->
    <div class="max-w-6xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <!-- Cartes des technologies -->
        <div
            v-for="(tech, index) in technologies"
            :key="tech.name"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            class="group relative"
        >
          <!-- Carte principale -->
          <div class="relative bg-[#1E1E1E] rounded-xl p-6 border border-gray-800 overflow-hidden">
            <!-- Background animé au hover -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <!-- Contenu -->
            <div class="relative z-10">
              <!-- En-tête avec icône et nom -->
              <div class="flex items-center gap-4 mb-6">
                <Icon
                    :name="tech.icon"
                    class="w-12 h-12"
                    :class="tech.iconColor"
                />
                <div>
                  <h3 class="text-xl font-bold text-white">
                    {{ tech.name }}
                  </h3>
                  <div class="flex items-center gap-1.5 mt-1">
                    <div
                        v-for="i in 5"
                        :key="i"
                        class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                        :class="i <= (tech.expertise / 20) ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-700'"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="font-mono text-sm text-gray-400 mb-4">
                // {{ tech.description }}
              </p>

              <!-- Liste des fonctionnalités -->
              <div class="space-y-2 font-mono text-sm">
                <div
                    v-for="feature in tech.features"
                    :key="feature"
                    class="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors"
                >
                  <span class="text-green-500 font-bold">→</span>
                  {{ feature }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const technologies = [
  {
    name: 'Vue.js',
    icon: 'logos:vue',
    iconColor: 'text-emerald-500',
    description: 'Framework progressif pour construire des interfaces utilisateur',
    expertise: 90,
    features: [
      'Composants réutilisables',
      'Réactivité puissante',
      'État global avec Pinia'
    ]
  },
  {
    name: 'Nuxt',
    icon: 'logos:nuxt-icon',
    iconColor: 'text-green-500',
    description: 'Framework Vue.js pour applications universelles',
    expertise: 85,
    features: [
      'SSR & SSG',
      'Architecture modulaire',
      'Performance optimisée'
    ]
  },
  {
    name: 'FastAPI',
    icon: 'simple-icons:fastapi',
    iconColor: 'text-teal-500',
    description: 'Framework Python moderne et rapide pour APIs',
    expertise: 80,
    features: [
      'API REST & GraphQL',
      'Documentation auto-générée',
      'Performance asyncio'
    ]
  },
  {
    name: 'PHP',
    icon: 'logos:php',
    iconColor: 'text-indigo-500',
    description: 'Langage de programmation côté serveur',
    expertise: 75,
    features: [
      'Développement backend',
      'Gestion base de données',
      'API REST'
    ]
  },
  {
    name: 'TailwindCSS',
    icon: 'logos:tailwindcss-icon',
    iconColor: 'text-sky-500',
    description: 'Framework CSS utilitaire',
    expertise: 95,
    features: [
      'Design responsive',
      'Personnalisation avancée',
      'Performance optimisée'
    ]
  },
  {
    name: 'TypeScript',
    icon: 'logos:typescript-icon',
    iconColor: 'text-blue-500',
    description: 'JavaScript avec typage statique',
    expertise: 85,
    features: [
      'Types statiques',
      'POO avancée',
      'Meilleure maintenabilité'
    ]
  }
]
</script>