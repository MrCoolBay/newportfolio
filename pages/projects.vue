<template>
  <main class="min-h-screen pt-10 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Import stylisé -->
      <div class="mb-16 max-w-7xl mx-auto px-4">
        <div class="flex items-baseline gap-4">
          <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Projets
          </h2>
          <div class="font-mono text-gray-400 text-sm">
            <span class="text-pink-600">import</span> { projects } <span class="text-pink-600">from</span> <span class="text-green-600">'./me'</span>
          </div>
        </div>
        <div class="mt-2 h-px w-full bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
      </div>

      <!-- Titre principal -->
      <div class="space-y-8 mb-16">
        <h1 class="text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          projects.map((project) => project.show());
        </h1>
      </div>

      <!-- Grille des projects -->
      <div class="grid md:grid-cols-2 gap-12">
        <!-- MercuriaRP -->
        <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            :duration="1000"
            class="group"
        >
          <div class="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-700 transition-colors"
                   @click="openUrl('https://mercuriarp.fr')"
              ></div>
              <span class="ml-2 text-sm text-gray-400">mercuriarp.fr</span>
            </div>

            <!-- Image du projet -->
            <div class="relative aspect-video overflow-hidden">
              <img
                  src="/projects/mercuriarp.png"
                  alt="MercuriaRP Preview"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-50"></div>
            </div>

            <!-- Infos du projet -->
            <div class="p-6 font-mono">
              <div class="text-sm space-y-4 text-white">
                <div>
                  <span class="text-pink-400">const</span> <span class="text-blue-400">project</span> = {
                  <div class="pl-4">
                    <span class="text-purple-400">name:</span> <span class="text-green-400">"MercuriaRP"</span>,<br>
                    <span class="text-purple-400">type:</span> <span class="text-green-400">"Solo Project"</span>,<br>
                    <span class="text-purple-400">stack:</span> [<br>
                    <div class="pl-4">
                      <span class="text-orange-400">"Vue.js"</span>,<br>
                      <span class="text-orange-400">"Nuxt"</span>,<br>
                      <span class="text-orange-400">"TailwindCSS"</span>
                    </div>
                    ]
                  </div>
                  }
                </div>

                <div class="text-gray-400">
                  // Site vitrine pour un serveur GTA RP,<br>
                  // réalisé en solo avec une approche moderne
                </div>
              </div>

              <!-- Lien vers le projet -->
              <a
                  href="https://mercuriarp.fr"
                  target="_blank"
                  class="inline-flex items-center gap-2 mt-6 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Visiter le site</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- LPNet -->
        <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            :duration="1000"
            class="group"
        >
          <div class="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-700 transition-colors"
              @click="openUrl('https://lpnet.fr')"></div>
              <span class="ml-2 text-sm text-gray-400">lpnet.fr</span>
            </div>

            <!-- Image du projet -->
            <div class="relative aspect-video overflow-hidden">
              <img
                  src="/projects/lpnet.png"
                  alt="LPNet Preview"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-50"></div>
            </div>

            <!-- Infos du projet -->
            <div class="p-6 font-mono">
              <div class="text-sm space-y-4 text-white">
                <div>
                  <span class="text-pink-400">const</span> <span class="text-blue-400">project</span> = {
                  <div class="pl-4">
                    <span class="text-purple-400">name:</span> <span class="text-green-400">"LPNet"</span>,<br>
                    <span class="text-purple-400">type:</span> <span class="text-green-400">"Collaboration"</span>,<br>
                    <span class="text-purple-400">stack:</span> [<br>
                    <div class="pl-4">
                      <span class="text-orange-400">"Vue.js"</span>,<br>
                      <span class="text-orange-400">"Nuxt"</span>,<br>
                      <span class="text-orange-400">"TailwindCSS"</span>
                    </div>
                    ]
                  </div>
                  }
                </div>

                <div class="text-gray-400">
                  // Site vitrine pour notre entreprise,<br>
                  // développé en collaboration
                </div>
              </div>

              <!-- Lien vers le projet -->
              <a
                  href="https://lpnet.fr"
                  target="_blank"
                  class="inline-flex items-center gap-2 mt-6 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Visiter le site</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>

function openUrl(url) {
  window.open(url, '_blank')
}

</script>