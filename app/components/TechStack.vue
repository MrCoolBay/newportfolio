<template>
  <section class="py-28">
    <h2 class="text-2xl font-bold text-ink">Stack technique</h2>
    <div class="relative mt-4 h-px w-full bg-zinc-200">
      <div class="absolute inset-y-0 left-0 w-16 bg-accent-600" />
    </div>

    <!-- Grille compacte. Les anciennes barres d'auto-évaluation (90 %, 85 %…)
         ont été retirées : une note qu'on s'attribue soi-même n'informe pas le
         lecteur et se retourne contre l'auteur en entretien. -->
    <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="(tech, index) in technologies"
        :key="tech.name"
        v-motion
        class="flex items-start gap-4 rounded-xl bg-shell p-5"
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
      >
        <Icon :name="tech.icon" class="mt-0.5 h-8 w-8 shrink-0" />
        <div>
          <h3 class="font-semibold text-white">{{ tech.name }}</h3>
          <p class="mt-1 font-mono text-xs leading-relaxed text-zinc-400">
            {{ tech.description }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
const technologies = [
  { name: 'Vue.js', icon: 'logos:vue', description: 'Interfaces réactives, composants réutilisables' },
  { name: 'Nuxt', icon: 'logos:nuxt-icon', description: 'Rendu serveur, routage, API intégrée' },
  { name: 'React Native', icon: 'logos:react', description: 'Applications iOS et Android multiplateformes' },
  { name: 'TypeScript', icon: 'logos:typescript-icon', description: 'Typage statique, POO' },
  { name: 'FastAPI', icon: 'simple-icons:fastapi', description: 'API Python asynchrones et documentées' },
  { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon', description: 'Design system utilitaire' },
  { name: 'Docker', icon: 'logos:docker-icon', description: 'Conteneurisation, pipelines CI/CD' },
]
</script>
