<template>
  <div
      v-show="isVisible && displayedText !== ''"
      class="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
      :class="{ 'fade-out': isFading }"
  >
    <div class="font-mono text-4xl md:text-6xl font-bold">
      <span class="text-ink">
        <span class="text-accent-600">/</span>{{ displayedText }}<span class="animate-blink">|</span>
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

/**
 * Budget total : ~1,2 s, contre ~5,8 s auparavant.
 *
 * L'ancienne version couvrait tout l'écran d'un calque blanc opaque pendant
 * près de six secondes, en bloquant le défilement. Pour un visiteur arrivant
 * d'une recherche, le site était une page blanche : le Largest Contentful
 * Paint mesurait le calque, pas le contenu, et la majorité des visites
 * partaient avant la fin de l'animation.
 *
 * Le verrou `overflow: hidden` sur le body est également supprimé : rien ne
 * doit empêcher un visiteur de défiler vers le contenu.
 */
const animateText = async () => {
  for (let i = 0; i <= fullText.length; i++) {
    displayedText.value = fullText.slice(0, i)
    await sleep(45)
  }

  await sleep(180)
  displayedText.value = shortText

  await sleep(160)
  isFading.value = true

  await sleep(300)
  isVisible.value = false
}

// Respecte `prefers-reduced-motion` : l'animation est purement décorative.
onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    isVisible.value = false
    return
  }
  animateText()
})
</script>

<style scoped>
.animate-blink {
  animation: blink 1s step-end infinite;
  /* Tailwind 4 : `@apply` dans un <style> de SFC exigerait une directive
     `@reference` (re-parse de la feuille à chaque bloc). Les jetons du thème
     sont exposés sur :root, autant les utiliser directement. */
  color: var(--color-accent-600);
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