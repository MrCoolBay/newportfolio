<template>
  <article
    v-motion
    class="flex h-full flex-col overflow-hidden rounded-xl bg-shell"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay } }"
  >
    <!-- Barre de fenêtre : identité visuelle du site -->
    <div class="flex items-center gap-2 bg-shell-bar px-4 py-3">
      <span class="h-3 w-3 rounded-full bg-red-500" />
      <span class="h-3 w-3 rounded-full bg-yellow-500" />
      <span class="h-3 w-3 rounded-full bg-green-500" />
      <span class="ml-2 font-mono text-sm text-zinc-400">{{ domain }}</span>
    </div>

    <div v-if="image" class="relative aspect-video overflow-hidden">
      <img
        :src="image"
        :alt="`Aperçu du site ${title}`"
        loading="lazy"
        class="h-full w-full object-cover"
      >
      <div class="absolute inset-0 bg-linear-to-t from-shell to-transparent opacity-60" />
    </div>

    <div class="flex grow flex-col gap-5 p-6">
      <div>
        <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
        <p class="mt-1 font-mono text-xs tracking-wide text-accent-400 uppercase">{{ type }}</p>
      </div>

      <p class="leading-relaxed text-zinc-400">{{ description }}</p>

      <ul class="flex flex-wrap gap-2">
        <li
          v-for="tech in stack"
          :key="tech"
          class="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-xs text-zinc-300"
        >
          {{ tech }}
        </li>
      </ul>

      <a
        v-if="href"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-auto inline-flex items-center gap-2 font-mono text-sm text-accent-400 transition-colors hover:text-accent-300"
      >
        <span>{{ linkLabel }}</span>
        <Icon name="heroicons:arrow-up-right" class="h-4 w-4" />
      </a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  /** Nature de la mission — sert à distinguer le client du projet personnel. */
  type: { type: String, required: true },
  domain: { type: String, required: true },
  description: { type: String, required: true },
  stack: { type: Array, default: () => [] },
  image: { type: String, default: '' },
  href: { type: String, default: '' },
  linkLabel: { type: String, default: 'Visiter le site' },
  delay: { type: Number, default: 0 },
})
</script>
