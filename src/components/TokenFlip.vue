<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{ close: [] }>()

type Side = 'left' | 'right'
const SIDES: Record<Side, { label: string; image: string }> = {
  left: { label: 'Left', image: 'images/token/left.png' },
  right: { label: 'Right', image: 'images/token/right.png' },
}

const rotation = ref(0) // front face = left (multiples of 360), back face = right (180 mod 360)
const flipping = ref(false)
const result = ref<Side | null>(null)
const failed = ref<Record<Side, boolean>>({ left: false, right: false })
let timer: ReturnType<typeof setTimeout> | undefined

function flip() {
  if (flipping.value) return
  const target: Side = Math.random() < 0.5 ? 'left' : 'right'
  const wanted = target === 'left' ? 0 : 180
  const delta = (((wanted - rotation.value) % 360) + 360) % 360
  rotation.value += 1080 + delta
  result.value = null
  flipping.value = true
  timer = setTimeout(() => {
    flipping.value = false
    result.value = target
  }, 1400)
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  else if (e.key === ' ') {
    e.preventDefault() // no page scroll, and no extra click on a focused button
    if (!e.repeat) flip()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(timer)
})
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="dialog" role="dialog" aria-label="Two-player token">
      <button class="x" aria-label="Close" @click="emit('close')">✕</button>
      <h2>Two-player token</h2>
      <p class="hint">Flip the token to see which leftover column to remove.</p>

      <!-- A div, not a button: Safari flattens 3D transforms inside <button> elements -->
      <div class="stage" role="button" tabindex="0" aria-label="Flip token" @click="flip">
        <div class="lift" :class="{ spinning: flipping }">
          <div class="coin" :style="{ transform: `rotateY(${rotation}deg)` }">
            <div v-for="(side, key) in SIDES" :key="key" class="face" :class="key">
              <img v-if="!failed[key]" :src="side.image" :alt="side.label" @error="failed[key] = true" />
              <span v-else class="fallback">{{ side.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <p class="outcome" :class="{ shown: result }">
        <template v-if="result">Remove the <strong>{{ SIDES[result].label.toLowerCase() }}</strong> column!</template>
        <template v-else-if="flipping">Flipping…</template>
        <template v-else>Tap the token or press space to flip it</template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(43, 58, 122, .55); display: grid; place-items: center; padding: 16px; }
.dialog { position: relative; width: min(420px, 100%); background: var(--cream); border: 3px solid var(--navy); border-radius: 18px;
  box-shadow: 0 6px 0 var(--brick); padding: 20px; text-align: center; }
h2 { margin: 0 0 4px; }
.hint { margin: 0 0 16px; font-size: .85rem; opacity: .8; }
.x { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--navy);
  background: #fff; color: var(--navy); font-weight: 800; line-height: 1; }
.stage { perspective: 900px; -webkit-perspective: 900px; width: var(--token-width); margin: 0 auto; cursor: pointer; -webkit-tap-highlight-color: transparent; outline-offset: 6px; }
.lift { transform-style: preserve-3d; -webkit-transform-style: preserve-3d; }
.coin { position: relative; width: 100%; aspect-ratio: var(--token-aspect); transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  transition: transform 1.4s cubic-bezier(.2, .7, .25, 1); }
.lift.spinning { animation: lift 1.4s ease-in-out; }
@keyframes lift { 50% { transform: translateY(-28px) scale(1.12); } }
.face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border: 3px solid var(--navy); border-radius: 12px; overflow: hidden;
  background: linear-gradient(160deg, var(--sky), var(--brick-light)); display: grid; place-items: center; box-shadow: 0 4px 0 var(--brick); }
.face.right { transform: rotateY(180deg); }
.face.left { transform: rotateY(0deg); }
.face img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fallback { font-family: 'Limelight', Georgia, serif; font-size: 2rem; color: var(--navy); text-transform: uppercase; }
.outcome { margin: 22px 0 0; min-height: 1.6em; font-size: 1.15rem; color: var(--navy); }
.outcome.shown { font-size: 1.4rem; }
.outcome strong { color: var(--orange); text-transform: uppercase; }
</style>
