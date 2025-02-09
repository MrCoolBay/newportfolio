<template>
  <div class="relative w-full h-full bg-black">
    <canvas
        ref="gameCanvas"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        :width="canvasWidth"
        :height="canvasHeight"
    ></canvas>

    <!-- Score -->
    <div class="absolute top-4 left-4 text-green-500 font-mono">
      Score: {{ score }}
    </div>

    <!-- Game Over -->
    <div v-if="gameOver" class="absolute inset-0 flex items-center justify-center bg-black/80">
      <div class="text-center">
        <p class="text-red-500 text-2xl font-bold mb-4">Game Over!</p>
        <button
            @click="startGame"
            class="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400"
        >
          Rejouer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasWidth = 400
const canvasHeight = 400
const gridSize = 20
const gameCanvas = ref(null)
const ctx = ref(null)
const snake = ref([])
const food = ref({ x: 0, y: 0 })
const direction = ref('right')
const gameLoop = ref(null)
const score = ref(0)
const gameOver = ref(false)

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
  gameLoop.value = setInterval(update, 100)
}

const spawnFood = () => {
  food.value = {
    x: Math.floor(Math.random() * (canvasWidth / gridSize)),
    y: Math.floor(Math.random() * (canvasHeight / gridSize))
  }
}

const update = () => {
  const head = { ...snake.value[0] }

  switch (direction.value) {
    case 'up': head.y--; break
    case 'down': head.y++; break
    case 'left': head.x--; break
    case 'right': head.x++; break
  }

  // Collision avec les murs
  if (head.x < 0 || head.x >= canvasWidth / gridSize ||
      head.y < 0 || head.y >= canvasHeight / gridSize) {
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

const draw = () => {
  if (!ctx.value) return

  // Effacer le canvas
  ctx.value.fillStyle = 'black'
  ctx.value.fillRect(0, 0, canvasWidth, canvasHeight)

  // Dessiner le serpent
  ctx.value.fillStyle = '#00ff00'
  snake.value.forEach(segment => {
    ctx.value.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize - 1,
        gridSize - 1
    )
  })

  // Dessiner la nourriture
  ctx.value.fillStyle = 'red'
  ctx.value.fillRect(
      food.value.x * gridSize,
      food.value.y * gridSize,
      gridSize - 1,
      gridSize - 1
  )
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