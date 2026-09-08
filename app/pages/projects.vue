<template>
  <main class="min-h-screen px-4 pt-10">
    <div class="container mx-auto max-w-6xl">
      <PageHeader
        title="Projets"
        module="projects"
        subtitle="Réalisations client et projets personnels. Chaque site est en ligne : le code et le rendu sont vérifiables."
      />

      <div class="grid gap-8 lg:grid-cols-2">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.domain"
          v-bind="project"
          :delay="index * 150"
        />
      </div>

      <!-- Passerelle vers la prestation : la page projets est le premier
           endroit où un prospect atterrit depuis une recherche. -->
      <section
        v-motion
        class="mt-16 rounded-xl border border-zinc-200 p-8"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
      >
        <h2 class="text-xl font-semibold text-ink">Un projet en tête ?</h2>
        <p class="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          Je suis disponible en freelance pour la conception et la refonte de
          sites vitrines, d'applications web et d'API. Devis gratuit après un
          premier échange sur votre besoin.
        </p>
        <NuxtLink
          to="/contact"
          class="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-mono text-sm text-white transition-colors hover:bg-accent-700"
        >
          <span>Discutons de votre projet</span>
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </section>
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Projets' })

/**
 * Les stacks listées sont celles réellement servies par chaque site
 * (signatures `_nuxt/`, en-têtes d'hébergeur), pas des déclarations d'intention.
 */
const projects = [
  {
    title: "L'Univers — Sedan",
    type: 'Client · Site vitrine',
    domain: 'lunivers-sedan.fr',
    description:
      "Site vitrine du bar L'Univers, institution sedanaise depuis 1932. Contrôle "
      + "d'âge à l'entrée, carte des boissons, galerie et page de localisation avec "
      + 'horaires. Visuels servis en WebP avec variantes responsive, déploiement sur '
      + "l'edge parisien de Vercel.",
    stack: ['Nuxt', 'Vue 3', 'Vercel'],
    image: '/projects/lunivers-sedan.webp',
    href: 'https://www.lunivers-sedan.fr',
  },
  {
    title: 'fabienlubin.fr',
    type: 'Projet personnel · Code ouvert',
    domain: 'github.com/mrcoolbay',
    description:
      'Ce site. Endpoint de contact durci — validation stricte, limitation de débit, '
      + "rejet des injections d'en-têtes SMTP — et campagne de tests de sécurité "
      + 'rejouable en une commande. Zéro vulnérabilité déclarée sur les dépendances.',
    stack: ['Nuxt 4', 'Tailwind 4', 'Nitro', 'Zod'],
    href: 'https://github.com/MrCoolBay/newportfolio',
    linkLabel: 'Voir le code',
  },
]
</script>
