<template>
  <main class="relative min-h-screen overflow-hidden">
    <!-- Background grid -->
    <div class="fixed inset-0">
      <div class="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] grid-rows-[repeat(auto-fill,minmax(50px,1fr))]">
        <div v-for="i in 100" :key="i" class="border border-gray-100/5" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="container mx-auto">
      <section class="min-h-screen relative flex -mb-30">
        <!-- Zone de code interactive -->
        <div class="grow flex flex-col lg:flex-row items-start gap-8 pt-32 px-4 lg:px-16">
          <!-- Conteneur pour le jeu et l'éditeur -->
          <div class="lg:w-1/2 relative">
            <!-- Jeu Snake en arrière-plan -->
            <div
                class="absolute inset-0 overflow-hidden rounded-lg transition-opacity duration-500 bg-[#1E1E1E]"
                :class="{'opacity-100 z-10': showSnake, 'opacity-0 -z-10': !showSnake}"
            >
              <SnakeGame v-if="showSnake" ref="snakeGame" />
            </div>

            <!-- Éditeur de code avec animation -->
            <div
                class="relative w-full transition-all duration-500 transform cursor-pointer"
                :class="{
                  'scale-75 translate-x-20 translate-y-20': isMinimized,
                  'scale-100': !isMinimized
                }"
                @click="isMinimized ? restoreWindow() : null"
            >
              <div
v-motion
                   class="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-xl"
                   :initial="{ opacity: 0, y: 20 }"
                   :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
                   :duration="1000"
              >
                <!-- Barre de titre -->
                <div class="flex items-center gap-2 p-4 bg-[#1A1A1A]">
                  <button
                      class="cursor-pointer w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                      @click="toggleMinimize"
                  />
                  <button
                      class="cursor-pointer w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                      @click="toggleMinimize"
                  />
                  <div class="w-3 h-3 rounded-full bg-green-500"/>
                </div>

                <!-- Contenu de l'éditeur -->
                <div
                    class="p-6 font-mono text-sm transition-opacity duration-500"
                    :class="{'opacity-30': isMinimized, 'opacity-100': !isMinimized}"

                >
                  <div class="space-y-4">
                    <div>
                      <span class="text-pink-400">import</span>
                      <span class="text-white"> { ref } </span>
                      <span class="text-pink-400">from</span>
                      <span class="text-green-400"> 'vue'</span>
                    </div>

                    <div class="text-blue-400">
                      const <span class="text-white">developer</span> = {
                    </div>

                    <div class="pl-6 space-y-2">
                      <div>
                        <span class="text-blue-400">name:</span>
                        <span class="text-green-400"> "Fabien Lubin"</span>,
                      </div>
                      <div>
                        <span class="text-blue-400">role:</span>
                        <span class="text-green-400"> "Full Stack Developer"</span>,
                      </div>
                      <div>
                        <span class="text-blue-400">stack:</span> [
                        <span class="text-green-400">"Vue.js", "Nuxt", "Node.js"</span>],
                      </div>
                      <div>
                        <span class="text-blue-400">location:</span>
                        <span class="text-green-400"> "France"</span>
                      </div>
                    </div>

                    <div class="text-blue-400">}</div>
                  </div>

                  <!-- Terminal intégré -->
                  <div class="mt-8 pt-4 border-t border-gray-700">
                    <div class="space-y-3">
                      <NuxtLink
                          to="/projects"
                          class="flex items-center gap-2 hover:bg-white/5 p-2 rounded-sm transition-colors"
                      >
                        <span class="text-gray-500">$</span>
                        <span class="text-blue-400">npm run</span>
                        <span class="text-emerald-400">projects</span>
                      </NuxtLink>

                      <NuxtLink
                          to="/contact"
                          class="flex items-center gap-2 hover:bg-white/5 p-2 rounded-sm transition-colors"
                      >
                        <span class="text-gray-500">$</span>
                        <span class="text-blue-400">npm run</span>
                        <span class="text-emerald-400">contact</span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Zone de présentation -->
          <div class="lg:w-1/2 pt-8 lg:pt-20"

          >
            <h1 class="space-y-4">
             <span
v-motion
                   class="block text-4xl lg:text-6xl font-bold text-gray-800"
                   :initial="{ opacity: 0, x: 50 }"
                   :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
                   :duration="1000"
             >
               Je suis
             </span>
              <span
v-motion
                    class="block text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600"
                    :initial="{ opacity: 0, x: 50 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 400 } }"
                    :duration="1000"
              >
               Fabien Lubin
             </span>
            </h1>

            <p
v-motion
               class="mt-6 text-lg text-gray-600 max-w-lg"
               :initial="{ opacity: 0, x: 50,  }"
               :enter="{ opacity: 1, x: 0, transition: { delay: 600 } }"
               :duration="1000"
            >
              // Développeur Full Stack passionné par la création d'expériences web modernes et innovantes
            </p>
          </div>
        </div>
      </section>
      <TechStack/>
    </div>
  </main>
</template>

<script setup>
const isMinimized = ref(false)
const showSnake = ref(false)
const snakeGame = ref(null)

// Restaurer la fenêtre
const restoreWindow = () => {
  isMinimized.value = false
  showSnake.value = false
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  if (isMinimized.value) {
    setTimeout(() => {
      showSnake.value = true
    }, 300)
  } else {
    showSnake.value = false
  }
}

// Empêcher le scroll avec les flèches
const preventScroll = (e) => {
  if (showSnake.value && ["ArrowUp", "ArrowDown", "Space"].includes(e.key)) {
    e.preventDefault()
  }
}

// Ajouter et nettoyer les event listeners
onMounted(() => {
  window.addEventListener('keydown', preventScroll)
})

onUnmounted(() => {
  window.removeEventListener('keydown', preventScroll)
})
</script>