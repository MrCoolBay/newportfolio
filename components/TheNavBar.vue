<template>
  <nav ref="navRef" class="fixed w-full z-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Container principal avec glassmorphism amélioré -->
      <div class="relative backdrop-blur-md bg-white/70 rounded-2xl shadow-lg border border-gray-200/20 overflow-hidden">
        <!-- Gradient interactif en arrière-plan -->
        <div
            class="absolute inset-0 opacity-[0.03]"
            :style="{
            background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgb(37, 99, 235), transparent 25%)`
          }"
        ></div>

        <div class="relative flex items-center justify-between h-16 px-6">
          <!-- Logo avec animation au scroll -->
          <div class="flex-shrink-0">
            <NuxtLink
                to="/"
                class="group relative text-2xl font-bold overflow-hidden inline-block"
            >
              <div class="relative inline-flex">
                <!-- Version normale -->
                <div class="relative inline-flex">
                  <!-- Slash fixe -->
                  <span class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300">/</span>

                  <!-- F et "abien" -->
                  <div class="relative inline-flex">
                    <span class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300">F</span>
                    <span
                        class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300 origin-left"
                        :class="{ 'opacity-0 scale-x-0': isScrolled }"
                    >abien</span>
                  </div>

                  <!-- L et "ubin" -->
                  <div
                      class="relative inline-flex transition-all duration-300 ml-1"
                      :class="{ '-translate-x-[4.2rem]': isScrolled }"
                  >
                    <span class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300">L</span>
                    <span
                        class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300 origin-left"
                        :class="{ 'opacity-0 scale-x-0': isScrolled }"
                    >ubin</span>
                  </div>

                  <!-- Chevron fermant avec ajustement de la translation -->
                  <span
                      class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300 ml-[0.1rem]"
                      :class="{ '-translate-x-[7.3rem]': isScrolled }"
                  >></span>
                </div>
              </div>

              <!-- Version hover avec gradient inversé -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div class="relative inline-flex">
                  <!-- Slash fixe -->
                  <span class="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent transition-all duration-300">/</span>

                  <!-- F et "abien" -->
                  <div class="relative inline-flex">
                    <span class="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent transition-all duration-300">F</span>
                    <span
                        class="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent transition-all duration-300 origin-left"
                        :class="{ 'opacity-0 scale-x-0': isScrolled }"
                    >abien</span>
                  </div>

                  <!-- L et "ubin" -->
                  <div
                      class="relative inline-flex transition-all duration-300 ml-1"
                      :class="{ '-translate-x-[4.2rem]': isScrolled }"
                  >
                    <span class="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent transition-all duration-300">L</span>
                    <span
                        class="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent transition-all duration-300 origin-left"
                        :class="{ 'opacity-0 scale-x-0': isScrolled }"
                    >ubin</span>
                  </div>

                  <!-- Chevron fermant -->
                  <span
                      class="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent transition-all duration-300 ml-[0.1rem]"
                      :class="{ '-translate-x-[7.3rem]': isScrolled }"
                  >></span>
                </div>
              </div>
            </NuxtLink>

          </div>

          <!-- Menu principal -->
          <div class="hidden md:flex items-center space-x-1">
            <template v-for="item in menuItems" :key="item.name">
              <NuxtLink
                  :to="item.href"
                  class="relative px-4 py-2 group overflow-hidden rounded-lg hover:text-white"
                  v-slot="{ isActive }"
              >
                <!-- Texte du menu -->
                <span
                    class="relative z-10 font-medium"
                    :class="isActive ? 'text-white' : 'text-gray-700 group-hover:text-white'"
                >
                  {{ item.name }}
                </span>

                <!-- Background animé -->
                <div
                    class="absolute inset-0 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600"
                    :class="[
                    isActive ? 'translate-y-0' : 'translate-y-full',
                    'group-hover:translate-y-0'
                  ]"
                ></div>
              </NuxtLink>
            </template>
          </div>

          <!-- Réseaux sociaux avec alignement corrigé -->
          <div class="hidden md:flex items-center -mt-0.5 space-x-4">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative p-2 rounded-lg overflow-hidden flex items-center justify-center"
            >
            <!-- Icône alignée verticalement -->
            <Icon
                :name="social.icon"
                class="relative z-10 w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300"
            />

            <!-- Background au hover -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Tooltip -->
            <span class="absolute left-1/2 -translate-x-1/2 -bottom-10 px-3 py-1 text-xs text-white bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300">
                {{ social.name }}
              </span>
            </a>
          </div>

          <!-- Menu burger mobile avec animation -->
          <button
              @click="isOpen = !isOpen"
              class="md:hidden relative w-10 h-10 focus:outline-none"
          >
            <div class="absolute inset-0 flex flex-col justify-center items-center">
              <span
                  class="w-6 h-0.5 bg-gray-600 transform transition-transform duration-300"
                  :class="{ 'rotate-45 translate-y-[0.3rem]': isOpen }"
              ></span>
              <span
                  class="w-6 h-0.5 bg-gray-600 mt-1.5 transition-opacity duration-300"
                  :class="{ 'opacity-0': isOpen }"
              ></span>
              <span
                  class="w-6 h-0.5 bg-gray-600 mt-1.5 transform transition-transform duration-300"
                  :class="{ '-rotate-45 -translate-y-[0.3rem]': isOpen }"
              ></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div v-if="isOpen" class="md:hidden mt-2">
          <div class="backdrop-blur-md bg-white/70 rounded-xl shadow-lg border border-gray-200/20 p-2">
            <NuxtLink
                v-for="item in menuItems"
                :key="item.name"
                :to="item.href"
                class="block px-4 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white rounded-lg transition-colors duration-300"
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useScroll } from '@vueuse/core'

const isOpen = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const navRef = ref(null)
const isScrolled = ref(false)

// Suivi du scroll
const { y } = useScroll(window)

// Observer le scroll pour changer le logo
watch(y, (newY) => {
  isScrolled.value = newY > 50
})

// Suivi de la souris pour l'effet de gradient
const handleMouseMove = (e) => {
  if (!navRef.value) return
  const navRect = navRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - navRect.left
  mouseY.value = e.clientY - navRect.top
}

onMounted(() => {
  if (navRef.value) {
    navRef.value.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (navRef.value) {
    navRef.value.removeEventListener('mousemove', handleMouseMove)
  }
})

const menuItems = [
  { name: 'Accueil', href: '/' },
  { name: 'À propos', href: '/about' },
  { name: 'Projets', href: '/projects' },
  { name: 'Contact', href: '/contact' }
]

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/mrcoolbay',
    icon: 'mdi:github'
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/fabien-lubin-695344291/',
    icon: 'mdi:linkedin'
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/fablbn_',
    icon: 'mdi:instagram'
  }
]
</script>

<style scoped>
/* Animations de transition pour le logo */
.logo-enter-active,
.logo-leave-active {
  transition: all 0.3s ease;
}

.logo-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.logo-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.logo-move {
  transition: transform 0.3s ease;
}

.scale-x-0 {
  transform: scaleX(0);
}

span {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

span:nth-child(4) {
  transform-origin: right;
}
</style>