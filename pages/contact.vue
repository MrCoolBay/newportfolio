<template>
  <main class="min-h-screen pt-10 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- En-tête stylisé -->
      <div class="mb-16 max-w-7xl mx-auto">
        <div class="flex items-baseline gap-4">
          <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact
          </h2>
          <div class="font-mono text-gray-400 text-sm">
            <span class="text-pink-600">import</span> { contact } <span class="text-pink-600">from</span> <span class="text-green-600">'./me'</span>
          </div>
        </div>
        <div class="mt-2 h-px w-full bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
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
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-2 text-sm text-gray-400">contact.js</span>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6 space-y-6 text-white">
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-mono text-gray-400">firstName: <span class="text-pink-400">string</span></label>
                <input
                    v-model="form.firstName"
                    type="text"
                    class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                    required
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-mono text-gray-400">lastName: <span class="text-pink-400">string</span></label>
                <input
                    v-model="form.lastName"
                    type="text"
                    class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                    required
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-mono text-gray-400">email: <span class="text-pink-400">string</span></label>
              <input
                  v-model="form.email"
                  type="email"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                  required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-mono text-gray-400">message: <span class="text-pink-400">string</span></label>
              <textarea
                  v-model="form.message"
                  class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 h-32 focus:border-blue-500 focus:outline-none"
                  required
              ></textarea>
            </div>

            <button
                type="submit"
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-mono"
                :disabled="isSubmitting"
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
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
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
        class="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";

// État du formulaire
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  message: "",
});

const isSubmitting = ref(false);
const showToast = ref(false);
const toastMessage = ref("");

// Fonction d'envoi du formulaire
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.value),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi");
    }

    Object.keys(form.value).forEach((key) => (form.value[key] = ""));
    toastMessage.value = "Message envoyé avec succès !";
    showToast.value = true;
    setTimeout(() => showToast.value = false, 5000);
  } catch (error) {
    console.error("Error:", error);
    toastMessage.value = "Une erreur est survenue. Veuillez réessayer.";
    showToast.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>