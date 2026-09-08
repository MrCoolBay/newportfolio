<template>
  <header class="mb-14">
    <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <h1 class="text-3xl font-bold text-ink">{{ title }}</h1>
      <p class="font-mono text-sm text-ink-muted">
        <span class="text-accent-700">import</span> { {{ module }} }
        <span class="text-accent-700">from</span>
        <span class="text-ink-soft">'./me'</span>
      </p>
    </div>

    <p v-if="subtitle" class="mt-4 max-w-2xl leading-relaxed text-ink-soft">
      {{ subtitle }}
    </p>

    <!-- Filet sobre : trait neutre pleine largeur, amorce d'accent à gauche.
         Remplace les dégradés bleu→violet qui étaient répétés sur chaque page. -->
    <div class="relative mt-6 h-px w-full bg-zinc-200">
      <div class="absolute inset-y-0 left-0 w-16 bg-accent-600" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  /** Titre de la page (rendu en h1 : chaque page doit en avoir exactement un). */
  title: { type: String, required: true },
  /** Jeton affiché dans la ligne `import { … } from './me'`. */
  module: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
