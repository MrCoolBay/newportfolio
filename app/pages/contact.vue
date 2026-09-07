<template>
  <main class="min-h-screen pt-10 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- En-tête stylisé -->
      <div class="mb-16 max-w-7xl mx-auto">
        <div class="flex items-baseline gap-4">
          <h2 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact
          </h2>
          <div class="font-mono text-gray-400 text-sm">
            <span class="text-pink-600">import</span> { contact } <span class="text-pink-600">from</span> <span class="text-green-600">'./me'</span>
          </div>
        </div>
        <div class="mt-2 h-px w-full bg-linear-to-r from-blue-600/50 to-purple-600/50"/>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Formulaire -->
        <div
            v-motion
            :initial="{ opacity: 0, x: -50 }"
            :enter="{ opacity: 1, x: 0 }"
            class="bg-[#1E1E1E] rounded-xl overflow-hidden"
        >
          <div class="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
            <div class="w-3 h-3 rounded-full bg-red-500"/>
            <div class="w-3 h-3 rounded-full bg-yellow-500"/>
            <div class="w-3 h-3 rounded-full bg-green-500"/>
            <span class="ml-2 text-sm text-gray-400">contact.js</span>
          </div>

          <form class="relative p-6 space-y-6 text-white" @submit.prevent="handleSubmit">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="firstName" class="block text-sm font-mono text-gray-400">firstName: <span class="text-pink-400">string</span></label>
                <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    name="firstName"
                    autocomplete="given-name"
                    maxlength="60"
                    required
                    class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-hidden"
                >
              </div>
              <div class="space-y-2">
                <label for="lastName" class="block text-sm font-mono text-gray-400">lastName: <span class="text-pink-400">string</span></label>
                <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    name="lastName"
                    autocomplete="family-name"
                    maxlength="60"
                    required
                    class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-hidden"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label for="email" class="block text-sm font-mono text-gray-400">email: <span class="text-pink-400">string</span></label>
              <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  name="email"
                  autocomplete="email"
                  maxlength="254"
                  required
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-hidden"
              >
            </div>

            <div class="space-y-2">
              <label for="message" class="block text-sm font-mono text-gray-400">message: <span class="text-pink-400">string</span></label>
              <textarea
                  id="message"
                  v-model="form.message"
                  name="message"
                  minlength="10"
                  maxlength="5000"
                  required
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 h-32 focus:border-blue-500 focus:outline-hidden"
              />
              <p class="text-xs font-mono text-gray-500">{{ form.message.length }} / 5000</p>
            </div>

            <!-- Piège à bots : sorti du flux, ignoré par le clavier et les
                 lecteurs d'écran. Un envoi avec ce champ rempli est rejeté
                 silencieusement côté serveur. -->
            <div class="absolute -left-[9999px] top-0" aria-hidden="true">
              <label for="website">Website</label>
              <input
                  id="website"
                  v-model="form.website"
                  type="text"
                  name="website"
                  tabindex="-1"
                  autocomplete="off"
              >
            </div>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="cursor-pointer w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-mono disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? "Envoi..." : "Envoyer" }}
            </button>
          </form>
        </div>

        <!-- Informations de contact -->
        <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
            class="bg-[#1E1E1E] rounded-xl overflow-hidden"
        >
          <div class="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
            <div class="w-3 h-3 rounded-full bg-red-500"/>
            <div class="w-3 h-3 rounded-full bg-yellow-500"/>
            <div class="w-3 h-3 rounded-full bg-green-500"/>
            <span class="ml-2 text-sm text-gray-400">terminal</span>
          </div>

          <div class="p-6 font-mono text-sm">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="text-green-400">➜</span>
                <span class="text-blue-400">whoami</span>
              </div>
              <div class="pl-4 text-gray-300">
                Fabien Lubin, Développeur Full Stack
              </div>

              <div class="flex items-center gap-2">
                <span class="text-green-400">➜</span>
                <span class="text-blue-400">contact --list</span>
              </div>
              <div class="pl-4 space-y-2">
                <a
                href="mailto:contact@fabienlubin.fr"
                class="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
                >
                <span class="text-blue-400">email:</span>
                <span class="text-gray-300">contact@fabienlubin.fr</span>
                </a>
                <div class="flex items-center gap-3 text-gray-400">
                  <span class="text-blue-400">location:</span>
                  <span class="text-gray-300">Grand Est, France</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-green-400">➜</span>
                <span class="text-blue-400">skills --top</span>
              </div>
              <div class="pl-4 text-gray-300 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-green-500">●</span> Vue.js, Nuxt
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-yellow-500">●</span> Node.js, PhP
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-blue-500">●</span> Python, FastAPI
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-green-400">➜</span>
                <span class="text-blue-400">status</span>
              </div>
              <div class="pl-4 text-green-400">
                Available for new projects ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
        v-if="showToast"
        role="status"
        aria-live="polite"
        class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white"
        :class="toastIsError ? 'bg-red-700' : 'bg-gray-800'"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script setup>
const EMPTY_FORM = { firstName: '', lastName: '', email: '', message: '', website: '' }

const form = ref({ ...EMPTY_FORM })
const isSubmitting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastIsError = ref(false)

let toastTimer

function notify(message, isError = false) {
  toastMessage.value = message
  toastIsError.value = isError
  showToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 6000)
}

onUnmounted(() => clearTimeout(toastTimer))

async function handleSubmit() {
  // Le bouton est déjà `disabled`, mais un double submit peut passer par la
  // touche Entrée avant le re-rendu.
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', { method: 'POST', body: form.value })
    form.value = { ...EMPTY_FORM }
    notify('Message envoyé avec succès !')
  }
  catch (error) {
    // Le serveur expose un message destiné à l'utilisateur pour 400/429/502/503 ;
    // tout le reste retombe sur un texte générique.
    notify(error?.data?.message || 'Une erreur est survenue. Veuillez réessayer.', true)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
