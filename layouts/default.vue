<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <!-- En-tête fixe avec la navbar -->
    <header class="fixed w-full top-0 z-50">
      <TheNavBar />
    </header>

    <!-- Contenu principal avec padding pour éviter le chevauchement avec la navbar -->
    <main class="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
      <!-- Slot pour le contenu des pages -->
      <slot />
    </main>

    <!-- Pied de page -->
    <TheFooter />
  </div>
</template>

<script setup>

</script>