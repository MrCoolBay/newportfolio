<template>
  <!-- Rien à afficher si l'API GitHub est indisponible : le panneau se masque
       plutôt que de laisser un bloc vide ou un message d'erreur. -->
  <section
    v-if="data"
    v-motion
    class="overflow-hidden rounded-xl bg-shell"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0 }"
  >
    <div class="flex items-center gap-2 bg-shell-bar px-4 py-3">
      <span class="h-3 w-3 rounded-full bg-red-500" />
      <span class="h-3 w-3 rounded-full bg-yellow-500" />
      <span class="h-3 w-3 rounded-full bg-green-500" />
      <span class="ml-2 font-mono text-sm text-zinc-400">github</span>
    </div>

    <div class="p-6 font-mono text-sm">
      <p class="text-zinc-300">
        <span class="text-emerald-400">➜</span>
        <span class="text-sky-400"> gh api</span> /users/{{ data.login }}
      </p>

      <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 pl-4 sm:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label">
          <dt class="text-xs text-zinc-500">{{ stat.label }}</dt>
          <dd class="mt-0.5 text-accent-400">{{ stat.value }}</dd>
        </div>
      </dl>

      <p v-if="data.languages.length" class="mt-6 text-zinc-300">
        <span class="text-emerald-400">➜</span>
        <span class="text-sky-400"> languages</span> --used
      </p>
      <ul v-if="data.languages.length" class="mt-3 flex flex-wrap gap-2 pl-4">
        <li
          v-for="language in data.languages"
          :key="language"
          class="flex items-center gap-1.5 rounded-sm border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
        >
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: colorFor(language) }" />
          {{ language }}
        </li>
      </ul>

      <p v-if="data.topRepos.length" class="mt-6 text-zinc-300">
        <span class="text-emerald-400">➜</span>
        <span class="text-sky-400"> gh repo list</span> --limit {{ data.topRepos.length }}
      </p>
      <ul v-if="data.topRepos.length" class="mt-3 space-y-3 pl-4">
        <li v-for="repo in data.topRepos" :key="repo.name">
          <a
            :href="repo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-wrap items-baseline gap-x-3 gap-y-1"
          >
            <span class="text-accent-400 group-hover:underline">{{ repo.name }}</span>
            <span v-if="repo.language" class="flex items-center gap-1.5 text-xs text-zinc-500">
              <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: colorFor(repo.language) }" />
              {{ repo.language }}
            </span>
            <span v-if="repo.stars" class="text-xs text-zinc-500">★ {{ repo.stars }}</span>
          </a>
          <p v-if="repo.description" class="mt-0.5 text-xs leading-relaxed text-zinc-500">
            {{ repo.description }}
          </p>
        </li>
      </ul>

      <a
        :href="data.url"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 inline-flex items-center gap-2 text-accent-400 transition-colors hover:text-accent-300"
      >
        <Icon name="mdi:github" class="h-4 w-4" />
        <span>Voir le profil complet</span>
      </a>
    </div>
  </section>
</template>

<script setup>
// Rendu côté serveur puis hydraté : le panneau est dans le HTML initial, donc
// visible sans JavaScript et indexable.
const { data } = await useFetch('/api/github')

const stats = computed(() => data.value
  ? [
      { label: 'dépôts publics', value: data.value.repos },
      { label: 'abonnés', value: data.value.followers },
      { label: 'langages', value: data.value.languages.length },
      { label: 'depuis', value: data.value.since },
    ]
  : [])

/** Couleurs officielles GitHub par langage, repli neutre au-delà. */
const LANGUAGE_COLORS = {
  Rust: '#dea584',
  Python: '#3572A5',
  Lua: '#000080',
  Shell: '#89e051',
  Vue: '#41b883',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  PHP: '#4F5D95',
  CSS: '#663399',
  HTML: '#e34c26',
  Dockerfile: '#384d54',
}

function colorFor(language) {
  return LANGUAGE_COLORS[language] ?? '#71717a'
}
</script>
