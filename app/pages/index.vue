<template>
  <main class="min-h-screen">
    <div class="container mx-auto max-w-6xl px-4">
      <!-- Hero -->
      <section class="flex flex-col items-start gap-12 pt-28 lg:flex-row lg:gap-16">
        <!-- Présentation : passe en premier sur mobile, l'éditeur est décoratif -->
        <div class="order-1 lg:order-2 lg:w-1/2 lg:pt-8">
          <p
            v-motion
            class="inline-flex items-center gap-2 rounded-full border border-accent-600/30 bg-accent-500/10 px-3 py-1 font-mono text-xs text-accent-700"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0 }"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-accent-600" />
            Disponible pour des missions freelance
          </p>

          <h1
            v-motion
            class="mt-6 text-5xl font-bold text-ink lg:text-6xl"
            :initial="{ opacity: 0, x: 30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
          >
            Fabien Lubin
          </h1>

          <p
            v-motion
            class="mt-3 font-mono text-lg text-accent-700"
            :initial="{ opacity: 0, x: 30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
          >
            Développeur full-stack
          </p>

          <p
            v-motion
            class="mt-6 max-w-lg leading-relaxed text-ink-soft"
            :initial="{ opacity: 0, x: 30 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
          >
            Spécialisé Vue.js / Nuxt et FastAPI. Je conçois des applications web
            performantes et sécurisées, de la maquette à la mise en production.
            Basé à Reims, en alternance en cyberdéfense et disponible en freelance.
          </p>

          <div
            v-motion
            class="mt-8 flex flex-wrap gap-3"
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
          >
            <NuxtLink
              to="/contact"
              class="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-mono text-sm text-white transition-colors hover:bg-accent-700"
            >
              <span>Me contacter</span>
              <Icon name="heroicons:arrow-right" class="h-4 w-4" />
            </NuxtLink>
            <NuxtLink
              to="/projects"
              class="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-5 py-3 font-mono text-sm text-ink transition-colors hover:border-accent-600 hover:text-accent-700"
            >
              Voir mes projets
            </NuxtLink>
          </div>
        </div>

        <!-- Éditeur décoratif. Cliquer sur la pastille rouge ou jaune réduit la
             fenêtre et révèle un Snake : easter egg volontaire. -->
        <div class="order-2 w-full lg:order-1 lg:w-1/2">
          <div class="relative">
            <div
              class="absolute inset-0 overflow-hidden rounded-lg bg-shell transition-opacity duration-500"
              :class="showSnake ? 'z-10 opacity-100' : '-z-10 opacity-0'"
            >
              <SnakeGame v-if="showSnake" />
            </div>

            <div
              class="relative w-full transform cursor-pointer transition-all duration-500"
              :class="{ 'translate-x-16 translate-y-16 scale-75': isMinimized }"
              @click="isMinimized ? restore() : null"
            >
              <div
                v-motion
                class="overflow-hidden rounded-lg bg-shell shadow-xl"
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
              >
                <div class="flex items-center gap-2 bg-shell-bar p-4">
                  <button
                    type="button"
                    aria-label="Réduire la fenêtre"
                    class="h-3 w-3 cursor-pointer rounded-full bg-red-500 transition-colors hover:bg-red-600"
                    @click="minimize"
                  />
                  <button
                    type="button"
                    aria-label="Réduire la fenêtre"
                    class="h-3 w-3 cursor-pointer rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600"
                    @click="minimize"
                  />
                  <span class="h-3 w-3 rounded-full bg-green-500" />
                  <span class="ml-2 font-mono text-sm text-zinc-500">developer.ts</span>
                </div>

                <div
                  class="p-6 font-mono text-sm transition-opacity duration-500"
                  :class="isMinimized ? 'opacity-30' : 'opacity-100'"
                >
                  <div class="space-y-1 text-zinc-300">
                    <p>
                      <span class="text-accent-400">const</span>
                      <span class="text-white"> developer </span>= {
                    </p>
                    <p class="pl-6">
                      <span class="text-sky-400">name</span>:
                      <span class="text-emerald-400">'Fabien Lubin'</span>,
                    </p>
                    <p class="pl-6">
                      <span class="text-sky-400">stack</span>: [<span class="text-emerald-400">'Nuxt'</span>, <span class="text-emerald-400">'FastAPI'</span>, <span class="text-emerald-400">'Docker'</span>],
                    </p>
                    <p class="pl-6">
                      <span class="text-sky-400">based</span>:
                      <span class="text-emerald-400">'Reims, FR'</span>,
                    </p>
                    <p class="pl-6">
                      <span class="text-sky-400">freelance</span>:
                      <span class="text-accent-400">true</span>
                    </p>
                    <p>}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Prestations : volet vitrine de l'auto-entreprise -->
      <section class="pt-28">
        <h2 class="text-2xl font-bold text-ink">Prestations</h2>
        <div class="relative mt-4 h-px w-full bg-zinc-200">
          <div class="absolute inset-y-0 left-0 w-16 bg-accent-600" />
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <article
            v-for="(service, index) in services"
            :key="service.title"
            v-motion
            class="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-accent-600/50"
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 120 } }"
          >
            <Icon :name="service.icon" class="h-6 w-6 text-accent-600" />
            <h3 class="mt-4 font-semibold text-ink">{{ service.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ service.description }}</p>
          </article>
        </div>
      </section>

      <TechStack />
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Développeur full-stack freelance à Reims' })

const isMinimized = ref(false)
const showSnake = ref(false)
let revealTimer

function minimize() {
  isMinimized.value = true
  clearTimeout(revealTimer)
  revealTimer = setTimeout(() => {
    showSnake.value = true
  }, 300)
}

function restore() {
  clearTimeout(revealTimer)
  isMinimized.value = false
  showSnake.value = false
}

// Le Snake capte les flèches : empêcher la page de défiler pendant la partie.
function preventScroll(event) {
  if (showSnake.value && ['ArrowUp', 'ArrowDown', 'Space', ' '].includes(event.key)) {
    event.preventDefault()
  }
}

onMounted(() => window.addEventListener('keydown', preventScroll))
onUnmounted(() => {
  window.removeEventListener('keydown', preventScroll)
  clearTimeout(revealTimer)
})

const services = [
  {
    title: 'Sites vitrines',
    icon: 'heroicons:window',
    description:
      'Site rapide, responsive et bien référencé, de la maquette à la mise en '
      + 'ligne. Vous restez autonome sur vos contenus.',
  },
  {
    title: 'Applications & API',
    icon: 'heroicons:code-bracket-square',
    description:
      'Applications métier et API sur mesure en Nuxt, Node.js ou FastAPI, '
      + 'testées et documentées.',
  },
  {
    title: 'Sécurité & déploiement',
    icon: 'heroicons:shield-check',
    description:
      'Durcissement, revue de code, conteneurisation Docker et pipelines '
      + "CI/CD pour livrer sans mauvaise surprise.",
  },
]
</script>
