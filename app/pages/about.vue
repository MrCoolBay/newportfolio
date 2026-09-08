<template>
  <main class="min-h-screen px-4 pt-10">
    <div class="container mx-auto max-w-6xl">
      <PageHeader
        title="Parcours"
        module="about"
        subtitle="Développeur full-stack spécialisé Vue.js / Nuxt et FastAPI. Je combine front-end et back-end pour livrer des solutions complètes, sobres et sécurisées."
      />

      <div class="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        <!-- Expériences -->
        <section>
          <h2 class="text-xl font-semibold text-ink">Expériences</h2>

          <ol class="mt-8 space-y-10">
            <li
              v-for="(job, index) in experiences"
              :key="job.company"
              v-motion
              class="relative border-l border-zinc-200 pl-6"
              :initial="{ opacity: 0, y: 16 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
            >
              <span
                class="absolute top-1.5 -left-[4.5px] h-2 w-2 rounded-full"
                :class="job.current ? 'bg-accent-600' : 'bg-zinc-300'"
              />
              <p class="font-mono text-xs tracking-wide text-ink-muted uppercase">
                {{ job.period }}
              </p>
              <h3 class="mt-1 font-semibold text-ink">{{ job.role }}</h3>
              <p class="text-sm text-accent-700">{{ job.company }}</p>
              <ul class="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                <li v-for="task in job.tasks" :key="task" class="flex gap-2">
                  <span class="text-accent-700">–</span>
                  <span>{{ task }}</span>
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <!-- Colonne latérale -->
        <div class="space-y-10">
          <!-- Compétences, en conservant l'esthétique terminal du site -->
          <section
            v-motion
            :initial="{ opacity: 0, x: 24 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }"
          >
            <div class="overflow-hidden rounded-xl bg-shell shadow-xl">
              <div class="flex items-center gap-2 bg-shell-bar px-4 py-3">
                <span class="h-3 w-3 rounded-full bg-red-500" />
                <span class="h-3 w-3 rounded-full bg-yellow-500" />
                <span class="h-3 w-3 rounded-full bg-green-500" />
                <span class="ml-2 font-mono text-sm text-zinc-400">skills</span>
              </div>
              <div class="space-y-3 p-6 font-mono text-sm">
                <p class="text-zinc-300">
                  <span class="text-emerald-400">➜</span>
                  <span class="text-sky-400"> skills</span> --list
                </p>
                <ul class="space-y-2 pl-4">
                  <li
                    v-for="skill in skills"
                    :key="skill.label"
                    class="flex items-center gap-2 text-zinc-300"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-accent-500" />
                    <span>{{ skill.label }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Formation -->
          <section
            v-motion
            :initial="{ opacity: 0, x: 24 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }"
          >
            <h2 class="text-xl font-semibold text-ink">Formation</h2>
            <ul class="mt-6 space-y-5">
              <li v-for="item in education" :key="item.title">
                <p class="font-mono text-xs tracking-wide text-ink-muted uppercase">
                  {{ item.year }}
                </p>
                <p class="mt-1 font-medium text-ink">{{ item.title }}</p>
                <p class="text-sm text-ink-soft">{{ item.school }}</p>
              </li>
            </ul>
          </section>

          <!-- Langues -->
          <section
            v-motion
            :initial="{ opacity: 0, x: 24 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 400 } }"
          >
            <h2 class="text-xl font-semibold text-ink">Langues</h2>
            <ul class="mt-4 space-y-2 text-sm text-ink-soft">
              <li>Français — langue maternelle</li>
              <li>Anglais — niveau intermédiaire</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Parcours' })

/**
 * ATTENTION — les missions listées pour France CyberDefense sont déduites du
 * poste (développeur full-stack en alternance) et de l'activité de
 * l'entreprise (SOC managé, investigation, réponse à incident). Elles sont
 * plausibles mais NON validées : à relire et corriger avec le réel avant de
 * considérer cette page comme définitive. Aucune donnée chiffrée, aucun nom de
 * client et aucun outil précis n'a été inventé.
 */
const experiences = [
  {
    role: 'Alternance — Développeur full-stack',
    company: 'France CyberDefense',
    period: 'Décembre 2025 — présent',
    current: true,
    tasks: [
      "Développement d'outils internes pour les équipes de supervision",
      'Conception d\'interfaces de restitution et d\'API pour exploiter les données de sécurité',
      'Automatisation de traitements récurrents et de la génération de rapports',
      'Conteneurisation Docker et intégration aux pipelines CI/CD',
    ],
  },
  {
    role: 'Alternance — Développeur full-stack',
    company: 'Agreego',
    period: 'Février 2025 — décembre 2025',
    tasks: [
      'Développement de fonctionnalités front-end et back-end pour des solutions internes',
      "Conception d'API performantes en Next.js et intégration de services externes (Google Maps)",
      "Participation à l'architecture applicative, à l'optimisation des performances et à la sécurité",
      "Mise en place de composants réutilisables et amélioration de l'expérience utilisateur",
    ],
  },
  {
    role: 'Stage — Développeur full-stack',
    company: 'HK-Tech',
    period: 'Juin — août 2024',
    tasks: [
      "Développement d'interfaces web modernes avec Vue.js et Nuxt",
      'Modules back-end en Python avec FastAPI pour automatiser des traitements de données',
      'Fonctionnalités menées de la conception à la production, avec pipeline et dockerisation',
    ],
  },
  {
    role: 'Sapeur-pompier volontaire',
    company: 'SDIS de la Marne',
    period: 'Septembre 2021 — présent',
    current: true,
    tasks: [
      'Interventions de secours à personnes, incendies et opérations diverses',
      'Gestion du stress, décision rapide et travail en équipe sous pression',
      'Formation continue aux techniques de secours et protocoles de sécurité',
    ],
  },
]

const skills = [
  { label: 'Vue.js, Nuxt, TypeScript' },
  { label: 'Node.js, PHP' },
  { label: 'Python, FastAPI' },
  { label: 'Docker, pipelines CI/CD' },
  { label: 'Cybersécurité applicative' },
  { label: 'Administration Linux' },
]

const education = [
  {
    year: 'Obtention prévue 2026',
    title: 'Bachelor Informatique',
    school: 'ESGI — École supérieure de génie informatique, Reims',
  },
  {
    year: '2023',
    title: 'Baccalauréat technologique',
    school: 'Lycée Roosevelt, Reims',
  },
  {
    year: '2021',
    title: 'Brevet national de jeune sapeur-pompier',
    school: 'UDJSP51, Suippes',
  },
]
</script>
