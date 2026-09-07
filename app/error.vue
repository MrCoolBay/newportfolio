<template>
  <main class="min-h-screen bg-white relative overflow-hidden">
    <!-- Background grid avec points plus visibles -->
    <div class="fixed inset-0">
      <div
          class="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(30px,1fr))] grid-rows-[repeat(auto-fill,minmax(30px,1fr))]"
      >
        <div
            v-for="i in 200"
            :key="i"
            class="relative"
        >
          <div
              class="absolute inset-0 m-auto w-1 h-1 bg-gray-200 rounded-full"
              :class="{ 'bg-blue-500/20': i % 7 === 0 }"
          />
        </div>
      </div>
    </div>

    <!-- Éléments décoratifs flottants -->
    <div
        v-for="n in 3"
        :key="n"
        class="absolute blur-3xl rounded-full opacity-[0.03]"
        :class="[
        n === 1 ? 'bg-blue-500 w-96 h-96 -top-20 -left-20' : '',
        n === 2 ? 'bg-purple-500 w-80 h-80 bottom-40 -right-20' : '',
        n === 3 ? 'bg-blue-500 w-64 h-64 top-1/2 left-1/3' : ''
      ]"
    />

    <!-- Contenu principal -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-3xl">
        <!-- Terminal d'erreur -->
        <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl"
        >
          <!-- Barre de titre avec lien sur la boule rouge -->
          <div class="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
            <NuxtLink
                to="/"
                class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                title="Retour à l'accueil"
                @click.prevent="handleError"
            />
            <div class="w-3 h-3 rounded-full bg-yellow-500"/>
            <div class="w-3 h-3 rounded-full bg-green-500"/>
            <span class="ml-2 text-sm text-gray-400 font-mono">error.js</span>
          </div>

          <!-- Contenu du terminal -->
          <div class="p-6 font-mono space-y-4">
            <!-- Message d'erreur stylisé -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-red-400">throw</span>
                <span class="text-red-400">new</span>
                <span class="text-purple-400">Error</span>
                <span class="text-gray-400">(</span>
                <span class="text-green-400">{{ getErrorMessage }}</span>
                <span class="text-gray-400">)</span>
              </div>

              <!-- Stack trace stylisée -->
              <div class="pl-4 text-gray-500 space-y-1 text-sm">
                <div>
                  at <span class="text-blue-400">Router</span>.handleError (<span class="text-gray-400">router.js:42:5</span>)
                </div>
                <div>
                  at <span class="text-blue-400">Navigation</span>.catch (<span class="text-gray-400">navigation.js:84:12</span>)
                </div>
              </div>
            </div>

            <!-- Code d'erreur animé -->
            <div
                v-motion
                class="text-[150px] font-bold text-blue-600 leading-none"
                :initial="{ opacity: 0, scale: 0.8 }"
                :enter="{ opacity: 1, scale: 1 }"
            >
              {{ error.statusCode }}
            </div>

            <!-- Message d'erreur explicatif -->
            <div class="text-gray-400 text-lg">
              {{ getErrorDescription }}
            </div>

            <!-- Action unique -->
            <div class="pt-4">
              <NuxtLink
                  to="/"
                  class="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
                  @click.prevent="handleError"
              >
                <span class="font-mono">cd /home</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// Messages d'erreur personnalisés
const errorMessages = {
  '404': '"Page not found: The requested resource could not be located"',
  '500': '"Internal Server Error: Something went wrong on our end"',
  '403': '"Forbidden: You don\'t have permission to access this resource"',
  default: '"An unexpected error occurred"'
}

// Descriptions d'erreur plus détaillées
const errorDescriptions = {
  '404': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  '500': 'Une erreur est survenue sur le serveur. Veuillez réessayer ultérieurement.',
  '403': 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.',
  default: 'Une erreur inattendue s\'est produite.'
}

// Getters pour les messages
const getErrorMessage = computed(() => {
  return errorMessages[props.error.statusCode] || errorMessages.default
})

const getErrorDescription = computed(() => {
  return errorDescriptions[props.error.statusCode] || errorDescriptions.default
})

/**
 * Sortie de l'état d'erreur.
 *
 * Un simple `<NuxtLink to="/">` ne suffit pas : tant que `clearError()` n'a pas
 * été appelé, Nuxt reste sur la page d'erreur. Le `href` est conservé (clic
 * milieu, ouverture dans un nouvel onglet) et `@click.prevent` prend le relais
 * pour la navigation normale.
 */
const handleError = () => clearError({ redirect: '/' })
</script>