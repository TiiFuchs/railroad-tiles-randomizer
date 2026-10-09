<script setup lang="ts">
import Tile from '../components/Tile.vue'
import ObjectiveSideToggle from '../components/ObjectiveSideToggle.vue'
import { useGame } from '../game'
import { SOURCE_COLORS } from '../data'
import { OBJECTIVE_COUNT } from '../randomizer'

const {
  step,
  objImage,
  hasRules,
  openInfo,
  promo,
  expansion,
  ratio,
  disabledObjectives,
  toggle,
  poolSources,
  objectivesOf,
  setGroup,
  ratios,
  nextFromObjectives,
} = useGame()
</script>

<template>
  <section class="panel bleed">
    <div class="topbar">
      <div v-if="expansion" class="picked">
        <Tile :name="expansion.name" :image="expansion.image" aspect="2" :color="SOURCE_COLORS[expansion.id]" selected />
      </div>
      <div class="ratio">
        <h3>Objective ratio <small>(expansion : other)</small></h3>
        <div class="ratios">
          <button v-for="r in ratios" :key="String(r.value)" class="chip" :class="{ on: ratio === r.value }" @click="ratio = r.value">
            <template v-if="r.value === 'free'">Free</template>
            <template v-else>{{ r.exp }} : {{ r.other }}</template>
          </button>
        </div>
        <p class="note">
          {{ ratio === 'free' ? 'Any 3 objectives from the whole pool.' : `${ratio} from ${expansion?.name ?? 'the expansion'}, ${OBJECTIVE_COUNT - (ratio as number)} from base/World/promo.` }}
        </p>
      </div>
    </div>
    <h2>Objectives <small>(click to disable)</small></h2>
    <ObjectiveSideToggle />
    <div v-for="s in poolSources" :key="s.id" class="group">
      <h3>
        {{ s.name }}
        <span class="links">
          <button class="link" @click="setGroup(objectivesOf(s.id).map((o) => o.id), disabledObjectives, true)">all</button> /
          <button class="link" @click="setGroup(objectivesOf(s.id).map((o) => o.id), disabledObjectives, false)">none</button>
        </span>
      </h3>
      <div class="grid obj">
        <div v-for="o in objectivesOf(s.id)" :key="o.id" class="cell">
          <button class="plain" @click="toggle(disabledObjectives, o.id)">
            <Tile :name="o.name" :image="objImage(o)" aspect="1" :color="SOURCE_COLORS[o.source]" :disabled="disabledObjectives.has(o.id)" />
          </button>
          <button v-if="hasRules(o.id)" class="info" aria-label="Show rules" @click="openInfo(o, '1', SOURCE_COLORS[o.source])">i</button>
        </div>
      </div>
    </div>
    <div class="nav">
      <button class="back" @click="step = 'expansions'">◀ Back</button>
      <button class="big" @click="nextFromObjectives">Next ▶</button>
    </div>
  </section>
</template>

<style scoped>
.obj { grid-template-columns: repeat(auto-fill, minmax(var(--size-objective), 1fr)); }
.topbar { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.picked { width: 200px; }
.ratio h3 { margin: 0 0 6px; font-size: .95rem; text-transform: capitalize; } .ratio h3 small { font-weight: 400; opacity: .7; }
.ratio .chip { padding: 4px 14px; font-weight: 700; }
.ratio .note { margin: 6px 0 0; }
.ratios { display: flex; gap: 12px; flex-wrap: wrap; }
.chip { display: grid; padding: 10px 18px; border: 3px solid var(--navy); border-radius: 14px; background: var(--cream);
  color: var(--navy); text-align: center; }
.chip span { font-size: .75rem; }
.chip.on { background: var(--navy); color: #fff; }
@media (max-width: 640px) {
  .picked { width: auto; margin: -16px -12px 12px; }
  .picked :deep(.tile) { border-radius: 0; border-width: 0 0 3px; box-shadow: none; }
  .topbar { display: grid; gap: 4px; }
  .obj { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .ratios { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .ratio .chip { padding: 8px 0; border-radius: 12px; }
}
@media (max-width: 379px) {
  .obj { grid-template-columns: 1fr; }
  .ratios { grid-template-columns: repeat(3, 1fr); }
}
</style>
