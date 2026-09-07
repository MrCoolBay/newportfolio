<template>
  <div
      v-show="isVisible && displayedText !== ''"
      class="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
      :class="{ 'fade-out': isFading }"
  >
    <div class="font-mono text-4xl md:text-6xl font-bold">
      <span class="bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        /{{ displayedText }}<span class="animate-blink">|</span>
      </span>
    </div>
  </div>
</template>

<script setup>
const isVisible = ref(true)
const isFading = ref(false)
const displayedText = ref('')
const fullText = 'FabienLubin>'
const shortText = 'FL>'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const animateText = async () => {
  await sleep(400)

  for (let i = 0; i <= fullText.length; i++) {
    displayedText.value = fullText.slice(0, i)
    await sleep(150)
  }

  await sleep(800)

  for (let i = fullText.length; i > 1; i--) {
    displayedText.value = fullText.slice(0, i)
    await sleep(75)
  }

  displayedText.value = shortText

  await sleep(800)

  isFading.value = true

  await sleep(1000)
  isVisible.value = false
  // S'assurer que le scroll est réactivé
  document.body.style.overflow = ''
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  animateText()
})

// Ajouter un cleanup au cas où le composant est détruit avant la fin de l'animation
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.animate-blink {
  animation: blink 1s step-end infinite;
  /* Tailwind 4 : `@apply` dans un <style> de SFC exigerait une directive
     `@reference` (re-parse de la feuille a chaque bloc). Les variables du
     theme sont exposees sur :root, autant les utiliser directement. */
  background-image: linear-gradient(
    to right,
    var(--color-blue-500),
    var(--color-purple-600)
  );
  background-clip: text;
  color: transparent;
}

@keyframes blink {
  from, to { opacity: 0 }
  50% { opacity: 1 }
}

.fade-out {
  animation: fadeOut 1s forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.1);
  }
}
</style>