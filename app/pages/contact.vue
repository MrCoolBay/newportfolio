<template>
  <main class="min-h-screen px-4 pt-10">
    <div class="container mx-auto max-w-6xl">
      <PageHeader
        title="Contact"
        module="contact"
        subtitle="Une mission, un devis, une question technique ? Décrivez votre besoin, je réponds sous 48 heures."
      />

      <div class="grid gap-12 lg:grid-cols-2">
        <!-- Formulaire -->
        <div
          v-motion
          class="overflow-hidden rounded-xl bg-shell"
          :initial="{ opacity: 0, x: -30 }"
          :enter="{ opacity: 1, x: 0 }"
        >
          <div class="flex items-center gap-2 bg-shell-bar px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-red-500" />
            <span class="h-3 w-3 rounded-full bg-yellow-500" />
            <span class="h-3 w-3 rounded-full bg-green-500" />
            <span class="ml-2 font-mono text-sm text-zinc-400">contact.ts</span>
          </div>

          <form class="relative space-y-6 p-6 text-white" @submit.prevent="handleSubmit">
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <label for="firstName" class="block font-mono text-sm text-zinc-400">
                  firstName: <span class="text-accent-400">string</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  name="firstName"
                  autocomplete="given-name"
                  maxlength="60"
                  required
                  :class="fieldClass"
                >
              </div>
              <div class="space-y-2">
                <label for="lastName" class="block font-mono text-sm text-zinc-400">
                  lastName: <span class="text-accent-400">string</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  name="lastName"
                  autocomplete="family-name"
                  maxlength="60"
                  required
                  :class="fieldClass"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label for="email" class="block font-mono text-sm text-zinc-400">
                email: <span class="text-accent-400">string</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                maxlength="254"
                required
                :class="fieldClass"
              >
            </div>

            <div class="space-y-2">
              <label for="message" class="block font-mono text-sm text-zinc-400">
                message: <span class="text-accent-400">string</span>
              </label>
              <textarea
                id="message"
                v-model="form.message"
                name="message"
                minlength="10"
                maxlength="5000"
                required
                :class="`${fieldClass} h-32`"
              />
              <p class="font-mono text-xs text-zinc-500">{{ form.message.length }} / 5000</p>
            </div>

            <!-- Piège à bots : sorti du flux, ignoré par le clavier et les
                 lecteurs d'écran. Un envoi avec ce champ rempli est rejeté
                 silencieusement côté serveur. -->
            <div class="absolute top-0 -left-[9999px]" aria-hidden="true">
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
              class="w-full cursor-pointer rounded-lg bg-accent-700 py-3 font-mono text-sm text-white transition-colors hover:bg-accent-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Envoi…' : 'Envoyer' }}
            </button>
          </form>
        </div>

        <!-- Informations -->
        <div
          v-motion
          class="space-y-8"
          :initial="{ opacity: 0, x: 30 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: 150 } }"
        >
          <div class="rounded-xl border border-zinc-200 p-6">
            <p class="inline-flex items-center gap-2 rounded-full border border-accent-600/30 bg-accent-500/10 px-3 py-1 font-mono text-xs text-accent-700">
              <span class="h-1.5 w-1.5 rounded-full bg-accent-600" />
              Disponible pour des missions freelance
            </p>

            <dl class="mt-6 space-y-4 text-sm">
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 font-mono text-ink-muted">e-mail</dt>
                <dd>
                  <a
                    href="mailto:contact@fabienlubin.fr"
                    class="text-accent-700 hover:underline"
                  >contact@fabienlubin.fr</a>
                </dd>
              </div>
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 font-mono text-ink-muted">secteur</dt>
                <dd class="text-ink-soft">Reims et Grand Est, missions à distance</dd>
              </div>
              <div class="flex gap-3">
                <dt class="w-24 shrink-0 font-mono text-ink-muted">réponse</dt>
                <dd class="text-ink-soft">Sous 48 heures ouvrées</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-xl border border-zinc-200 p-6">
            <h2 class="font-semibold text-ink">Ce qui aide à répondre vite</h2>
            <ul class="mt-4 space-y-2 text-sm text-ink-soft">
              <li v-for="hint in hints" :key="hint" class="flex gap-2">
                <span class="text-accent-700">–</span>
                <span>{{ hint }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="showToast"
      role="status"
      aria-live="polite"
      class="fixed right-4 bottom-4 rounded-lg px-6 py-3 text-white shadow-lg"
      :class="toastIsError ? 'bg-red-700' : 'bg-ink'"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Contact' })

const fieldClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 focus:border-accent-500 focus:outline-hidden'

const hints = [
  'La nature du projet : vitrine, application, API, reprise d\'un existant',
  'Une échéance, même approximative',
  'Un ordre de budget, pour cadrer la proposition',
]

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
