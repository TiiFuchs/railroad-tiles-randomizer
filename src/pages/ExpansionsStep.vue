<script setup lang="ts">
import Tile from '../components/Tile.vue'
import { rulebookFor } from '../rulebooks'
import { useGame } from '../game'
import { EXPANSIONS, PROMO, SOURCE_COLORS, WORLD } from '../data'

const {
  showToken,
  openRulebook,
  disabledExpansions,
  world,
  promo,
  toggle,
  setGroup,
  drawExpansion,
  quickPlay,
  resetAll,
} = useGame()
</script>

<template>
  <section class="panel">
    <h2>
      Which expansions do you own? <small>(click to toggle)</small>
      <span class="links">
        <button class="link" @click="setGroup(EXPANSIONS.map((e) => e.id), disabledExpansions, true)">all</button> /
        <button class="link" @click="setGroup(EXPANSIONS.map((e) => e.id), disabledExpansions, false)">none</button>
      </span>
    </h2>
    <div class="grid exp">
      <div v-for="e in EXPANSIONS" :key="e.id" class="cell">
        <button class="plain" @click="toggle(disabledExpansions, e.id)">
          <Tile :name="e.name" :image="e.image" aspect="2" :color="SOURCE_COLORS[e.id]" :disabled="disabledExpansions.has(e.id)" />
        </button>
        <button v-if="rulebookFor(e.id)" class="info right" aria-label="Open rulebook" @click="openRulebook(e.id, e.name)">i</button>
      </div>
    </div>
    <div class="extras">
      <div class="cell">
        <button class="plain" @click="world = !world">
          <Tile :name="WORLD.name" :image="WORLD.image" aspect="2" :color="SOURCE_COLORS.world" :disabled="!world" :tag="world ? 'On' : 'Off'" />
        </button>
        <button v-if="rulebookFor(WORLD.id)" class="info right" aria-label="Open rulebook" @click="openRulebook(WORLD.id, WORLD.name)">i</button>
      </div>
      <div class="cell">
        <button class="plain" @click="promo = !promo">
          <Tile :name="PROMO.name" :image="PROMO.image" aspect="2" :disabled="!promo" :tag="promo ? 'On' : 'Off'" />
        </button>
        <button v-if="rulebookFor(PROMO.id)" class="info right" aria-label="Open rulebook" @click="openRulebook(PROMO.id, PROMO.name)">i</button>
      </div>
      <p class="note">
        The World expansion adds objectives and lets you randomize the special pawns. The promo pack adds 2 objectives.
      </p>
    </div>
    <div class="nav">
      <button class="quick" title="Draw immediately with your saved settings" @click="quickPlay">⚡ Quick play</button>
      <button class="big" @click="drawExpansion">Next ▶</button>
    </div>
    <p class="reset">
      <button class="back pill" @click="showToken = true">🪙 Two-player token</button>
    </p>
    <p class="reset">
      <button class="link" @click="resetAll">Reset all settings</button>
      <small>— re-enables every expansion, objective and pawn</small>
    </p>
  </section>
</template>

<style scoped>
.exp { grid-template-columns: repeat(auto-fill, minmax(var(--size-expansion), 1fr)); }
.extras { display: grid; grid-template-columns: var(--size-expansion) var(--size-expansion) 1fr; gap: 12px; margin-top: 16px; align-items: center; }
.quick { font-weight: 800; font-size: 1.1rem; padding: 10px 24px; border-radius: 30px; border: 3px solid var(--navy);
  background: var(--cream); color: var(--navy); box-shadow: 0 4px 0 var(--navy); }
.quick:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--navy); }
.quick + .big { margin-left: auto; }
@media (max-width: 640px) {
  .extras { grid-template-columns: 1fr 1fr; } .extras .note { grid-column: 1 / -1; }
  .nav .quick { padding: 8px 18px; }
}
</style>
