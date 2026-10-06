<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import Tile from './Tile.vue'
import { parseBold } from '../setup-rules'

const props = defineProps<{ name: string; image: string; text: string; aspect: string; color?: string }>()
const emit = defineEmits<{ close: [] }>()

const parts = computed(() => parseBold(props.text))
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="dialog" role="dialog" :aria-label="name">
      <button class="x" aria-label="Close" @click="emit('close')">✕</button>
      <div class="tile-wrap"><Tile :name="name" :image="image" :aspect="aspect" :color="color" /></div>
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
.backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(43, 58, 122, .55); display: grid; place-items: center; padding: 16px; overflow-y: auto; }
.dialog { position: relative; width: min(380px, 100%); background: var(--cream); border: 3px solid var(--navy); border-radius: 18px;
  box-shadow: 0 6px 0 var(--brick); padding: 20px; }
.x { position: absolute; top: 10px; right: 10px; z-index: 2; width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--navy);
  background: #fff; color: var(--navy); font-weight: 800; line-height: 1; }
.tile-wrap { width: min(100%, 260px); margin: 8px auto 0; }
.text { margin: 18px 0 0; font-size: 1.05rem; line-height: 1.45; color: var(--navy); }
</style>
