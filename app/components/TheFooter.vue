<template>
  <footer class="mt-20 border-t border-zinc-200">
    <div class="container mx-auto max-w-6xl px-4 py-12">
      <div class="grid gap-10 md:grid-cols-3">
        <div>
          <NuxtLink to="/" class="font-mono text-lg font-bold text-ink">
            <span class="text-accent-700">/</span>FabienLubin<span class="text-accent-700">&gt;</span>
          </NuxtLink>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Développeur full-stack à Reims.<br>
            Disponible pour des missions freelance.
          </p>
        </div>

        <nav aria-label="Pied de page">
          <h2 class="font-mono text-sm text-ink">Navigation</h2>
          <ul class="mt-4 space-y-2 text-sm">
            <li v-for="item in menuItems" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="text-ink-soft transition-colors hover:text-accent-700"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 class="font-mono text-sm text-ink">Contact</h2>
          <ul class="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="mailto:contact@fabienlubin.fr"
                class="text-ink-soft transition-colors hover:text-accent-700"
              >
                contact@fabienlubin.fr
              </a>
            </li>
            <li
              v-for="social in socialLinks"
              :key="social.name"
            >
              <a
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-accent-700"
              >
                <Icon :name="social.icon" class="h-4 w-4" />
                {{ social.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p class="font-mono">© {{ year }} Fabien Lubin</p>
        <NuxtLink to="/mentions-legales" class="transition-colors hover:text-accent-700">
          Mentions légales
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Calculé au rendu : évite une année figée dans le build.
const year = new Date().getFullYear()

const menuItems = [
  { name: 'Accueil', href: '/' },
  { name: 'Parcours', href: '/about' },
  { name: 'Projets', href: '/projects' },
  { name: 'Contact', href: '/contact' },
]

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/mrcoolbay', icon: 'mdi:github' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/fabien-lubin-695344291/', icon: 'mdi:linkedin' },
]
</script>
