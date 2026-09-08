<template>
  <main class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-2xl">
      <div
        v-motion
        class="overflow-hidden rounded-xl bg-shell shadow-2xl"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <div class="flex items-center gap-2 bg-shell-bar px-4 py-3">
          <button
            type="button"
            aria-label="Retour à l'accueil"
            class="h-3 w-3 cursor-pointer rounded-full bg-red-500 transition-colors hover:bg-red-600"
            @click="handleError"
          />
          <span class="h-3 w-3 rounded-full bg-yellow-500" />
          <span class="h-3 w-3 rounded-full bg-green-500" />
          <span class="ml-2 font-mono text-sm text-zinc-400">error.ts</span>
        </div>

        <div class="space-y-6 p-8 font-mono">
          <p class="text-sm">
            <span class="text-red-400">throw new</span>
            <span class="text-accent-400"> Error</span><span class="text-zinc-500">(</span><span class="text-emerald-400">{{ message }}</span><span class="text-zinc-500">)</span>
          </p>

          <p class="text-7xl leading-none font-bold text-accent-500">
            {{ error.statusCode }}
          </p>

          <p class="leading-relaxed text-zinc-400">{{ description }}</p>

          <!--
            Un simple <NuxtLink to="/"> ne suffit pas : tant que `clearError()`
            n'a pas été appelé, Nuxt reste sur la page d'erreur. Le `href` est
            conservé (clic milieu, nouvel onglet) et `@click.prevent` prend le
            relais pour la navigation normale.
          -->
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-3 text-sm text-zinc-300 transition-colors hover:border-accent-600 hover:text-accent-400"
            @click.prevent="handleError"
          >
            <span>cd /home</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  error: { type: Object, required: true },
})

/**
 * Messages issus d'une liste blanche : `error.message` peut contenir des
 * détails internes au serveur et ne doit jamais être rendu tel quel.
 */
const MESSAGES = {
  404: "'Page not found: the requested resource could not be located'",
  403: "'Forbidden: you don\\'t have permission to access this resource'",
  500: "'Internal Server Error: something went wrong on our end'",
}

const DESCRIPTIONS = {
  404: "La page que vous recherchez n'existe pas ou a été déplacée.",
  403: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
  500: 'Une erreur est survenue sur le serveur. Veuillez réessayer ultérieurement.',
}

const message = computed(() => MESSAGES[props.error.statusCode] ?? "'An unexpected error occurred'")
const description = computed(() => DESCRIPTIONS[props.error.statusCode] ?? "Une erreur inattendue s'est produite.")

const handleError = () => clearError({ redirect: '/' })
</script>
