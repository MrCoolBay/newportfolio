<template>
  <main class="min-h-screen pt-10 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- En-tête stylisé -->
      <div class="mb-16 max-w-7xl mx-auto px-4">
        <div class="flex items-baseline gap-4">
          <h2 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            A propos
          </h2>
          <div class="font-mono text-gray-400 text-sm">
            <span class="text-pink-600">import</span> { about } <span class="text-pink-600">from</span> <span class="text-green-600">'./me'</span>
          </div>
        </div>
        <div class="mt-2 h-px w-full bg-linear-to-r from-blue-600/50 to-purple-600/50"/>
      </div>

      <!-- Section principale -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <!-- Colonne gauche -->
        <div class="space-y-12">
          <!-- Section Passion -->
          <section
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0 }"
              :duration="500"
              class="relative"
          >
            <div class="absolute -left-4 top-0 bottom-0 w-px bg-linear-to-b from-blue-600 to-purple-600"/>
            <h2 class="text-2xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              console.log("L'informatique est ma passion");
            </h2>
            <p class="text-gray-600 leading-relaxed">
              <span class="text-gray-400">// Mon histoire avec le code</span><br>
              Depuis que je suis tout petit, j'ai toujours été passionné par l'informatique. J'ai commencé à configurer des petits serveurs Minecraft dès le collège, et c'est là que j'ai découvert le développement web.
            </p>
          </section>

          <!-- Section Formation -->
          <section
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
              :duration="500"
              class="relative"
          >
            <div class="absolute -left-4 top-0 bottom-0 w-px bg-linear-to-b from-blue-600 to-purple-600"/>
            <div class="bg-[#1E1E1E] rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500"/>
                <div class="w-3 h-3 rounded-full bg-yellow-500"/>
                <div class="w-3 h-3 rounded-full bg-green-500"/>
              </div>
              <code class="block text-sm text-white leading-relaxed">
                <span class="text-pink-400">const</span> <span class="text-blue-400">formation</span> = {<br>
                <span class="pl-4">école: <span class="text-green-400">"ESGI"</span>,</span><br>
                <span class="pl-4">niveau: <span class="text-green-400">"Bachelor Informatique"</span>,</span><br>
                <span class="pl-4">année: <span class="text-orange-400">2</span></span><br>
                }
              </code>
            </div>
          </section>
        </div>

        <!-- Colonne droite -->
        <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 400 } }"
            :duration="500"
            class="relative"
        >
          <!-- Terminal avec expérience -->
          <div class="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-xl">
            <div class="flex items-center gap-2 p-4 bg-gray-800">
              <div class="w-3 h-3 rounded-full bg-red-500"/>
              <div class="w-3 h-3 rounded-full bg-yellow-500"/>
              <div class="w-3 h-3 rounded-full bg-green-500"/>
              <span class="ml-2 text-sm text-gray-400">terminal</span>
            </div>

            <div class="p-6 font-mono text-sm space-y-4">
              <!-- Commandes de terminal stylisées -->
              <div class="text-white">
                <span class="text-green-400">➜</span> <span class="text-blue-400">skills</span> --list
              </div>
              <div class="pl-4 space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"/>
                  <span class="text-gray-300">HTML5, CSS3, JavaScript</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"/>
                  <span class="text-gray-300">Vue.js, Nuxt.js</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-yellow-500"/>
                  <span class="text-gray-300">PHP, Python (Flask, FastAPI)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-blue-500"/>
                  <span class="text-gray-300">Linux, Windows Administration</span>
                </div>
              </div>

              <div class="text-white mt-6">
                <span class="text-green-400">➜</span> <span class="text-blue-400">experience</span> --show
              </div>
              <div class="pl-4 text-gray-300">
                # Alternance chez Agreego (Depuis Janvier 2025)<br>
                • Développement Angular<br>
                • Création d'APIs avec Node.js<br>
                • Gestion de projets full-stack
              </div>
              <div class="pl-4 text-gray-300">
                # Stage chez HK-Tech (Juillet - Août 2024)<br>
                • Développement Vue.js/Nuxt<br>
                • Création d'APIs avec FastAPI<br>
                • Gestion de projets full-stack
              </div>
            </div>
          </div>

          <!-- Compteur d'années stylisé -->
          <div
              class="absolute -right-8 -bottom-8 w-32 h-32 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white transform rotate-3 shadow-xl"
          >
            <div class="text-center">
              <div class="text-4xl font-bold">5</div>
              <div class="text-sm">années d'école</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton CV -->
<!--      <div-->
<!--          v-motion-->
<!--          :initial="{ opacity: 0, y: 20 }"-->
<!--          :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"-->
<!--          class="mt-16 text-center"-->
<!--      >-->
<!--        <a-->
<!--            href="/cv.pdf"-->
<!--            target="_blank"-->
<!--            class="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform"-->
<!--        >-->
<!--          <span>Consulter mon CV</span>-->
<!--          <Icon name="heroicons:arrow-right" class="w-5 h-5" />-->
<!--        </a>-->
<!--      </div>-->
    </div>
  </main>
</template>
<script setup lang="ts">
</script>