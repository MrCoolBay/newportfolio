<template>
  <LoadingScreen v-if="!hasVisited" />
  <div class="relative min-h-screen bg-white overflow-hidden">
    <!-- Contenu principal -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// État du loader
const hasVisited = ref(false)

onMounted(() => {
  const visited = localStorage.getItem('hasVisited')
  if (visited) {
    hasVisited.value = true
  } else {
    setTimeout(() => {
      localStorage.setItem('hasVisited', 'true')
      hasVisited.value = true
    }, 5000)
  }
})
</script>

<style>
body {
  font-family: 'Space Grotesk', sans-serif;
  margin: 0;
  padding: 0;
}

/* Animations de page */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>