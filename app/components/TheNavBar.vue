<template>
  <nav class="fixed z-50 w-full p-4">
    <div class="mx-auto max-w-7xl">
      <div class="rounded-2xl border border-zinc-200/60 bg-white/80 shadow-sm backdrop-blur-md">
        <div class="flex h-16 items-center justify-between px-6">
          <!--
            Logo : `/FabienLubin>` se replie en `/FL>` au défilement, à tous les
            formats d'écran.

            La version précédente utilisait `hidden sm:inline`, ce qui annulait
            l'effet au-delà de 640 px et, en dessous, masquait « Fabien » pour
            ne laisser que « /Lubin> ».

            `items-center` plutôt que `items-baseline` : un élément flex en
            `overflow-hidden` voit sa ligne de base synthétisée depuis son bord
            de bordure, ce qui décalerait verticalement les lettres pendant le
            repli. Toutes les parties partageant la même fonte et la même
            taille, le centrage vertical est équivalent et stable.

            Largeurs en `ch` : en monospace, 1ch vaut exactement une gouttière
            de caractère, donc `5ch` est la largeur juste d'« abien ». Une
            valeur en rem trop généreuse laisserait un temps mort au début de la
            transition, pendant lequel la contrainte reste au-dessus de la
            largeur réelle du texte.

            Les lettres repliées restent dans le DOM : un lecteur d'écran
            annonce toujours le nom complet.
          -->
          <NuxtLink
            to="/"
            class="inline-flex items-center font-mono text-xl font-bold text-ink transition-colors hover:text-accent-600"
          >
            <span class="text-accent-600">/</span>
            <span>F</span>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
              :class="isScrolled ? 'max-w-0 opacity-0' : 'max-w-[5ch] opacity-100'"
            >abien</span>
            <span>L</span>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-300 ease-out"
              :class="isScrolled ? 'max-w-0 opacity-0' : 'max-w-[4ch] opacity-100'"
            >ubin</span>
            <span class="text-accent-600">&gt;</span>
          </NuxtLink>

          <!-- Navigation bureau -->
          <div class="hidden items-center gap-1 md:flex">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.name"
              :to="item.href"
              class="relative rounded-lg px-4 py-2 font-medium text-ink-soft transition-colors hover:text-ink"
              active-class="text-ink"
            >
              {{ item.name }}
              <!-- Soulignement d'accent : remplace le fond dégradé coulissant -->
              <span
                v-if="isCurrent(item.href)"
                class="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-accent-600"
              />
            </NuxtLink>
          </div>

          <div class="flex items-center gap-1">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg p-2 text-ink-soft transition-colors hover:text-accent-600"
            >
              <Icon :name="social.icon" class="h-5 w-5" />
            </a>

            <!-- Burger mobile -->
            <button
              type="button"
              :aria-expanded="isOpen"
              aria-label="Ouvrir le menu"
              class="ml-1 flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
              @click="isOpen = !isOpen"
            >
              <span
                class="h-0.5 w-6 bg-ink-soft transition-transform duration-300"
                :class="{ 'translate-y-2 rotate-45': isOpen }"
              />
              <span
                class="h-0.5 w-6 bg-ink-soft transition-opacity duration-300"
                :class="{ 'opacity-0': isOpen }"
              />
              <span
                class="h-0.5 w-6 bg-ink-soft transition-transform duration-300"
                :class="{ '-translate-y-2 -rotate-45': isOpen }"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Menu mobile -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-4 opacity-0"
      >
        <div v-if="isOpen" class="mt-2 md:hidden">
          <div class="rounded-xl border border-zinc-200/60 bg-white/90 p-2 shadow-sm backdrop-blur-md">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.name"
              :to="item.href"
              class="block rounded-lg px-4 py-2.5 text-ink-soft transition-colors hover:bg-zinc-100 hover:text-ink"
              active-class="text-accent-700"
              @click="isOpen = false"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()
const isOpen = ref(false)
const isScrolled = ref(false)

/**
 * Détection du défilement par écouteur natif.
 *
 * `useScroll` de VueUse était l'unique usage de `@vueuse/core` dans tout le
 * projet, et il imposait de différer son appel à `onMounted` puisque `window`
 * n'existe pas au rendu serveur. Quinze lignes remplacent la dépendance.
 *
 * `passive: true` empêche l'écouteur de retarder le défilement, et le
 * regroupement par `requestAnimationFrame` évite de réévaluer à chaque
 * événement.
 */
const SCROLL_THRESHOLD = 50
let pending = false

function readScroll() {
  if (pending) return
  pending = true
  requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > SCROLL_THRESHOLD
    pending = false
  })
}

onMounted(() => {
  readScroll()
  window.addEventListener('scroll', readScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', readScroll))

// Referme le menu mobile à la navigation.
watch(() => route.path, () => {
  isOpen.value = false
})

const menuItems = [
  { name: 'Accueil', href: '/' },
  { name: 'Parcours', href: '/about' },
  { name: 'Projets', href: '/projects' },
  { name: 'Contact', href: '/contact' },
]

/** `active-class` de NuxtLink marque aussi les parents : on compare exactement. */
function isCurrent(href) {
  return route.path === href
}

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/mrcoolbay', icon: 'mdi:github' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/fabien-lubin-695344291/', icon: 'mdi:linkedin' },
]
</script>
