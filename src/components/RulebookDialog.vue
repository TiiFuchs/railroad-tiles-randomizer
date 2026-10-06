<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useScrollLock } from '../scrollLock'

defineProps<{ title: string; url: string }>()
const emit = defineEmits<{ close: [] }>()
useScrollLock()

const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="dialog" role="dialog" :aria-label="`${title} rulebook`">
      <header>
        <strong>{{ title }} rulebook</strong>
        <span class="actions">
          <a :href="url" target="_blank" rel="noopener">Open in new tab ↗</a>
          <button class="x" aria-label="Close" @click="emit('close')">✕</button>
        </span>
      </header>
      <iframe :src="url" :title="`${title} rulebook`"></iframe>
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 100; overscroll-behavior: contain; background: rgba(43, 58, 122, .55); display: grid; place-items: center; padding: 3vh 3vw; }
.dialog { width: min(1100px, 100%); height: 100%; display: flex; flex-direction: column; background: var(--cream); border: 3px solid var(--navy);
  border-radius: 18px; box-shadow: 0 6px 0 var(--brick); overflow: hidden; }
header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 14px; color: var(--navy); border-bottom: 3px solid var(--navy); }
.actions { display: flex; align-items: center; gap: 14px; font-size: .9rem; }
.actions a { color: var(--blue); }
.x { width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--navy); background: #fff; color: var(--navy); font-weight: 800; line-height: 1; }
iframe { flex: 1; width: 100%; border: 0; background: #fff; }
</style>
