<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Tile from './Tile.vue'
import { parseBold } from '../setup-rules'
import { useScrollLock } from '../scrollLock'

const props = defineProps<{ name: string; image: string; backImage?: string; text: string; aspect: string; color?: string }>()
const emit = defineEmits<{ close: [] }>()
useScrollLock()
const peek = ref(false)

const parts = computed(() => parseBold(props.text))
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="dialog" role="dialog" :aria-label="name">
      <button class="x" aria-label="Close" @click="emit('close')">✕</button>
      <div v-if="backImage" class="pair" :class="{ peek }" @pointerdown="peek = true" @pointerup="peek = false"
        @pointercancel="peek = false" @pointerleave="peek = false" @contextmenu.prevent>
        <div class="tile-wrap front"><Tile :name="name" :image="image" :aspect="aspect" :color="color" /></div>
        <div class="tile-wrap back"><Tile :name="name + ' (back)'" :image="backImage" :aspect="aspect" :color="color" /></div>
        <p class="hint">Touch and hold to see the back</p>
      </div>
      <div v-else class="tile-wrap"><Tile :name="name" :image="image" :aspect="aspect" :color="color" /></div>
      <p class="text">
        <template v-for="(part, i) in parts" :key="i">
          <strong v-if="part.bold">{{ part.text }}</strong>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 100; overscroll-behavior: contain; background: rgba(43, 58, 122, .55); display: grid; place-items: center; padding: 16px; overflow-y: auto; }
.dialog { position: relative; width: min(380px, 100%); background: var(--cream); border: 3px solid var(--navy); border-radius: 18px;
  box-shadow: 0 6px 0 var(--brick); padding: 20px; }
.x { position: absolute; top: 10px; right: 10px; z-index: 2; width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--navy);
  background: #fff; color: var(--navy); font-weight: 800; line-height: 1; }
.tile-wrap { width: min(100%, 260px); margin: 8px auto 0; }
.pair { display: grid; touch-action: manipulation; -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; }
.pair .tile-wrap { grid-area: 1 / 1; }
.pair .back, .pair.peek .front { visibility: hidden; }
.pair.peek .back { visibility: visible; }
.hint { grid-area: 2 / 1; margin: 8px 0 0; text-align: center; font-size: .8rem; opacity: .7; color: var(--navy); }
@media (min-width: 900px) and (hover: hover) and (pointer: fine) {
  .dialog:has(.pair) { width: min(640px, 100%); }
  .pair { grid-template-columns: 1fr 1fr; gap: 16px; }
  .pair .tile-wrap { grid-area: auto; width: 100%; }
  .pair .back { visibility: visible; }
  .pair.peek .front { visibility: visible; }
  .hint { display: none; }
}
.text { margin: 18px 0 0; font-size: 1.05rem; line-height: 1.45; color: var(--navy); text-align: justify; }
</style>
