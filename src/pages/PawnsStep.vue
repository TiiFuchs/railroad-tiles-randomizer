<script setup lang="ts">
import Tile from '../components/Tile.vue'
import { useGame } from '../game'

const {
  step,
  hasRules,
  openInfo,
  disabledPawns,
  pawnGroups,
  toggle,
  setGroup,
  pawnsReady,
  showResult,
} = useGame()
</script>

<template>
  <section class="panel bleed">
    <h2>Special pawns <small>(click to disable)</small></h2>
    <div v-for="g in pawnGroups" :key="g.type" class="group">
      <h3>
        {{ g.title }}
        <span class="links">
          <button class="link" @click="setGroup(g.pawns.map((p) => p.id), disabledPawns, true)">all</button> /
          <button class="link" @click="setGroup(g.pawns.map((p) => p.id), disabledPawns, false)">none</button>
        </span>
      </h3>
      <div class="grid pawn">
        <div v-for="p in g.pawns" :key="p.id" class="cell">
          <button class="plain" @click="toggle(disabledPawns, p.id)">
            <Tile :name="p.name" :image="p.image" aspect="4/3" :disabled="disabledPawns.has(p.id)" />
          </button>
          <button v-if="hasRules(p.id)" class="info" aria-label="Show rules" @click="openInfo(p, '4/3')">i</button>
        </div>
      </div>
    </div>
    <p v-if="!pawnsReady" class="note warn">Select at least one pawn of each type to have pawns randomized.</p>
    <div class="nav">
      <button class="back" @click="step = 'objectives'">◀ Back</button>
      <button class="big" @click="showResult">Next ▶</button>
    </div>
  </section>
</template>

<style scoped>
.pawn { grid-template-columns: repeat(auto-fill, minmax(var(--size-pawn), 1fr)); }
.warn { color: var(--orange); font-weight: 700; }
@media (max-width: 640px) {
  .pawn { grid-template-columns: repeat(3, 1fr); gap: 8px; }
}
@media (max-width: 379px) {
  .pawn { grid-template-columns: repeat(2, 1fr); }
}
</style>
