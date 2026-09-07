<template>
  <div class="relative w-full h-full bg-black">
    <canvas
        ref="gameCanvas"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-700"
        :width="canvasWidth"
        :height="canvasHeight"
    />

    <!-- Score -->
    <div class="absolute top-4 left-4 text-green-500 font-mono">
      Score: {{ score }}
    </div>

    <!-- Game Over -->
    <div v-if="gameOver" class="absolute inset-0 flex items-center justify-center bg-black/80">
      <div class="text-center">
        <p class="text-red-500 text-2xl font-bold mb-4">GAME OVER !</p>
        <button
            class="cursor-pointer px-4 py-2 bg-green-500 text-black rounded-sm hover:bg-green-400"
            @click="startGame"
        >
          Rejouer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Constantes du jeu
const canvasWidth = 400
const canvasHeight = 400
const gridSize = 20
const boardWidth = canvasWidth / gridSize
const boardHeight = canvasHeight / gridSize
const gameSpeed = ref(150)

// Refs
const gameCanvas = ref(null)
const ctx = ref(null)
const snake = ref([])
const food = ref({ x: 0, y: 0 })
const direction = ref('right')
const gameLoop = ref(null)
const score = ref(0)
const gameOver = ref(false)

// Démarrage du jeu
const startGame = () => {
  snake.value = [
    { x: 3, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 1 }
  ]
  direction.value = 'right'
  score.value = 0
  gameOver.value = false
  spawnFood()
  if (gameLoop.value) clearInterval(gameLoop.value)
  gameLoop.value = setInterval(update, gameSpeed.value)
}

// Spawn de la nourriture (corrigé pour rester dans les limites)
const spawnFood = () => {
  const availableSpots = []

  // Créer une liste de toutes les positions disponibles
  for (let x = 0; x < boardWidth; x++) {
    for (let y = 0; y < boardHeight; y++) {
      // Vérifier si la position n'est pas occupée par le serpent
      if (!snake.value.some(segment => segment.x === x && segment.y === y)) {
        availableSpots.push({ x, y })
      }
    }
  }

  // Choisir une position aléatoire parmi les disponibles
  const randomIndex = Math.floor(Math.random() * availableSpots.length)
  food.value = availableSpots[randomIndex]
}

// Mise à jour du jeu
const update = () => {
  const head = { ...snake.value[0] }

  switch (direction.value) {
    case 'up': head.y--; break
    case 'down': head.y++; break
    case 'left': head.x--; break
    case 'right': head.x++; break
  }

  // Collision avec les murs (maintenant visuellement cohérent avec les bordures)
  if (head.x < 0 || head.x >= boardWidth || head.y < 0 || head.y >= boardHeight) {
    endGame()
    return
  }

  // Collision avec soi-même
  if (snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame()
    return
  }

  snake.value.unshift(head)

  // Manger la nourriture
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    spawnFood()
  } else {
    snake.value.pop()
  }

  draw()
}

// Dessin amélioré avec grille et bordures
const draw = () => {
  if (!ctx.value) return

  // Effacer le canvas
  ctx.value.fillStyle = 'black'
  ctx.value.fillRect(0, 0, canvasWidth, canvasHeight)

  // Dessiner la grille (optionnel, pour le débogage)
  ctx.value.strokeStyle = '#1a1a1a'
  for (let x = 0; x < canvasWidth; x += gridSize) {
    ctx.value.beginPath()
    ctx.value.moveTo(x, 0)
    ctx.value.lineTo(x, canvasHeight)
    ctx.value.stroke()
  }
  for (let y = 0; y < canvasHeight; y += gridSize) {
    ctx.value.beginPath()
    ctx.value.moveTo(0, y)
    ctx.value.lineTo(canvasWidth, y)
    ctx.value.stroke()
  }

  // Dessiner le serpent avec effet de gradient
  snake.value.forEach((segment, index) => {
    const greenValue = Math.floor(255 * (1 - index / snake.value.length))
    ctx.value.fillStyle = `rgb(0, ${greenValue}, 0)`
    ctx.value.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    )
  })

  // Dessiner la nourriture avec un effet de brillance
  ctx.value.fillStyle = 'red'
  ctx.value.beginPath()
  ctx.value.arc(
      food.value.x * gridSize + gridSize/2,
      food.value.y * gridSize + gridSize/2,
      gridSize/3,
      0,
      Math.PI * 2
  )
  ctx.value.fill()
}

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.value !== 'down') direction.value = 'up'
      break
    case 'ArrowDown':
      if (direction.value !== 'up') direction.value = 'down'
      break
    case 'ArrowLeft':
      if (direction.value !== 'right') direction.value = 'left'
      break
    case 'ArrowRight':
      if (direction.value !== 'left') direction.value = 'right'
      break
  }
}

const endGame = () => {
  clearInterval(gameLoop.value)
  gameOver.value = true
}

onMounted(() => {
  ctx.value = gameCanvas.value.getContext('2d')
  window.addEventListener('keydown', handleKeydown)
  startGame()
})

onUnmounted(() => {
  if (gameLoop.value) clearInterval(gameLoop.value)
  window.removeEventListener('keydown', handleKeydown)
})
</script>