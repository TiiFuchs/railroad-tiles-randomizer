<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SETUP_RULES, parseBold, setupImage } from '../setup-rules'
import { imageUrl } from '../imageUrl'

const props = defineProps<{ expansionId: string; expansionName: string }>()
const steps = computed(() => (SETUP_RULES[props.expansionId] ?? []).map(parseBold))
const imageFailed = ref(false)
watch(() => props.expansionId, () => (imageFailed.value = false))
</script>

<template>
  <div v-if="steps.length" class="setup">
    <h3>Additional setup: {{ expansionName }}</h3>
    <div class="body">
      <ol>
        <li v-for="(step, i) in steps" :key="i">
          <template v-for="(part, j) in step" :key="j">
            <strong v-if="part.bold">{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </li>
      </ol>
      <img v-if="!imageFailed" :src="imageUrl(setupImage(expansionId))" loading="lazy" decoding="async" :alt="`${expansionName} setup`" @error="imageFailed = true" />
    </div>
  </div>
</template>

<style scoped>
.setup { margin-top: 20px; padding: 14px 18px; border: 3px solid var(--navy); border-radius: 14px; background: var(--cream); }
.setup h3 { margin: 0 0 10px; text-transform: none; }
.body { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
ol { flex: 1; min-width: 240px; margin: 0; padding-left: 22px; display: grid; gap: 8px; }
img { max-width: min(100%, var(--size-setup-image)); border-radius: 10px; border: 2px solid var(--navy); }
</style>
