<template>
  <footer class="relative my-20">
    <div class="container mx-auto px-4">
      <!-- Container principal avec glassmorphism léger -->
      <div class="relative backdrop-blur-md bg-white/70 rounded-2xl p-8 border border-gray-200/20 shadow-lg">
        <!-- Gradient interactif -->
        <div
            class="absolute inset-0 opacity-[0.03] rounded-2xl"
            :style="{
            background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgb(37, 99, 235), transparent 25%)`
          }"
        ></div>

        <!-- Contenu principal -->
        <div class="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Logo et description -->
          <div class="space-y-4">
            <NuxtLink to="/" class="inline-block text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              /FabienLubin>
            </NuxtLink>
            <p class="text-gray-600 font-mono">
              // Full Stack Developer<br/>
              // Passionné par le web
            </p>
          </div>

          <!-- Navigation -->
          <div>
            <h3 class="font-mono text-gray-800 mb-4">navigation.map(</h3>
            <div class="space-y-2 pl-4">
              <NuxtLink
                  v-for="item in menuItems"
                  :key="item.name"
                  :to="item.href"
                  class="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                { name: "{{ item.name }}" }
              </NuxtLink>
            </div>
            <div class="font-mono text-gray-800 mt-4">)</div>
          </div>

          <!-- Réseaux sociaux -->
          <div>
            <h3 class="font-mono text-gray-800 mb-4">connect()</h3>
            <div class="space-y-4 pl-4">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-3 group text-gray-600 hover:text-blue-600 transition-colors"
              >
              <Icon :name="social.icon" class="w-5 h-5" />
              <span class="font-mono">{{ social.name }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-12 pt-4 border-t border-gray-200/20 text-center text-sm text-gray-500 font-mono">
          © {{ new Date().getFullYear() }} - await developer.code() with ♥
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const mouseX = ref(0)
const mouseY = ref(0)
const footerRef = ref(null)

const handleMouseMove = (e) => {
  if (!footerRef.value) return
  const rect = footerRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

onMounted(() => {
  if (footerRef.value) {
    footerRef.value.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (footerRef.value) {
    footerRef.value.removeEventListener('mousemove', handleMouseMove)
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