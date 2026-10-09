<script setup lang="ts">
import { ref, watch } from 'vue'
import { imageUrl } from '../imageUrl'
const props = defineProps<{ name: string; image: string; selected?: boolean; disabled?: boolean; aspect?: string; tag?: string; tagColor?: string; color?: string }>()

// Dark text on light pill colors for readability
const textOn = (hex?: string) => {
  if (!hex) return '#fff'
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r! + 0.587 * g! + 0.114 * b! > 160 ? 'var(--navy)' : '#fff'
}
const failed = ref(false)
watch(() => props.image, () => (failed.value = false))
</script>

<template>
  <div class="tile" :class="{ selected, disabled }">
    <div class="media" :style="{ aspectRatio: aspect ?? '1' }">
      <img v-if="!failed" :src="imageUrl(image)" :alt="name" loading="lazy" decoding="async" @error="failed = true" />
      <div v-else class="placeholder"><span class="rails"></span></div>
    </div>
    <span class="label" :style="color ? { background: color, color: textOn(color) } : undefined">{{ name }}</span>
    <span v-if="tag" class="tag" :style="tagColor ? { background: tagColor, color: textOn(tagColor) } : undefined">{{ tag }}</span>
  </div>
</template>

<style scoped>
.tile {
  position: relative; overflow: hidden; border-radius: 14px; border: 3px solid var(--navy);
  background: var(--cream); box-shadow: 0 4px 0 var(--brick); transition: transform .15s, filter .2s;
}
.tile.disabled { filter: grayscale(1) opacity(.45); }
.media { position: relative; width: 100%; }
img, .placeholder { width: 100%; height: 100%; object-fit: cover; display: block; }
.placeholder {
  background: linear-gradient(160deg, var(--sky) 0%, var(--teal) 55%, var(--brick-light) 100%);
  display: grid; place-items: center;
}
.rails { width: 70%; height: 22%; border-top: 4px solid var(--navy); border-bottom: 4px solid var(--navy);
  background: repeating-linear-gradient(90deg, var(--navy) 0 4px, transparent 4px 14px); opacity: .5; }
.label {
  display: block; border-top: 3px solid var(--navy); padding: 4px 6px; text-align: center; font-size: .8rem;
  font-weight: 700; background: var(--cream); color: var(--navy);
}
.tag { position: absolute; top: 6px; left: 6px; font-size: .65rem; font-weight: 700; padding: 2px 6px;
  border-radius: 8px; background: var(--orange); color: #fff; text-transform: uppercase; }
@media (max-width: 640px) {
  .label { font-size: .7rem; padding: 3px 4px; }
  .tag { font-size: .55rem; }
}
</style>
