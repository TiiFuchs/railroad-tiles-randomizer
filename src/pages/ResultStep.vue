<script setup lang="ts">
import Tile from '../components/Tile.vue'
import SetupRules from '../components/SetupRules.vue'
import ObjectiveSideToggle from '../components/ObjectiveSideToggle.vue'
import { rulebookFor } from '../rulebooks'
import { useGame } from '../game'
import { SOURCE_COLORS } from '../data'

const {
  showToken,
  objImage,
  openRulebook,
  hasRules,
  openInfo,
  expansion,
  result,
  toggle,
  quickPlay,
  excluding,
  marked,
  justExcluded,
  replaced,
  expansionMarked,
  replaceNote,
  resultIds,
  startExcluding,
  applyExclusions,
  replaceMarked,
  restart,
} = useGame()
</script>

<template>
  <section v-if="result" class="panel bleed result">
    <div v-if="expansion" class="exp-col">
      <button class="plain" :class="{ marking: excluding, clickable: !excluding && !!rulebookFor(expansion.id) }" :disabled="!excluding && !rulebookFor(expansion.id)"
        @click="excluding ? toggle(marked, expansion.id) : openRulebook(expansion.id, expansion.name)">
        <Tile :name="expansion.name" :image="expansion.image" aspect="2" :color="SOURCE_COLORS[expansion.id]" :selected="!excluding" :disabled="marked.has(expansion.id) && excluding" />
        <span v-if="excluding" class="mark" :class="{ on: marked.has(expansion.id) }">{{ marked.has(expansion.id) ? '✕' : '' }}</span>
      </button>
    </div>
    <p v-else class="note">No expansion enabled — playing the base game.</p>
    <ObjectiveSideToggle class="result-toggle" />
    <div class="result-items">
      <div class="obj-list">
        <button v-for="o in result.objectives" :key="o.id" class="plain" :class="{ marking: excluding, clickable: !excluding && hasRules(o.id) }"
          :disabled="!excluding && !hasRules(o.id)" @click="excluding ? toggle(marked, o.id) : openInfo(o, '1', SOURCE_COLORS[o.source])">
          <Tile :name="o.name" :image="objImage(o)" aspect="1" :color="SOURCE_COLORS[o.source]" :selected="!excluding" :disabled="marked.has(o.id) && excluding"
            :tag="o.source === 'base' ? '' : o.source" :tag-color="SOURCE_COLORS[o.source]" />
          <span v-if="excluding" class="mark" :class="{ on: marked.has(o.id) }">{{ marked.has(o.id) ? '✕' : '' }}</span>
        </button>
      </div>
      <div v-if="result.pawns" class="pawn-row">
        <div v-for="(p, type) in result.pawns" :key="type" class="pawn-item">
          <h3>{{ type }}</h3>
          <button class="plain" :class="{ marking: excluding, clickable: !excluding && hasRules(p.id) }" :disabled="!excluding && !hasRules(p.id)"
            @click="excluding ? toggle(marked, p.id) : openInfo(p, '4/3')">
            <Tile :name="p.name" :image="p.image" aspect="4/3" :selected="!excluding" :disabled="marked.has(p.id) && excluding" />
            <span v-if="excluding" class="mark" :class="{ on: marked.has(p.id) }">{{ marked.has(p.id) ? '✕' : '' }}</span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="excluding" class="exclude-bar">
      <span>Tap the tiles you don't want ({{ marked.size }} selected). <b>Replace</b> draws new ones now; both options keep them out of future draws.<template v-if="expansionMarked"> The expansion can only be excluded, not replaced.</template></span>
      <button class="link" @click="resultIds.forEach((id) => marked.add(id))">all</button> /
      <button class="link" @click="marked.clear()">none</button>
      <div class="exclude-actions">
        <button class="back" @click="excluding = false">Cancel</button>
        <button class="back" :disabled="!marked.size" @click="applyExclusions">Just exclude{{ marked.size ? ` ${marked.size}` : '' }}</button>
        <button class="big small" :disabled="!marked.size || expansionMarked" @click="replaceMarked">Replace{{ marked.size ? ` ${marked.size}` : '' }}</button>
      </div>
    </div>
    <template v-else>
      <p v-if="replaced" class="note done">✓ {{ replaced }} tile(s) replaced and excluded from future draws.</p>
      <p v-if="replaceNote" class="note">{{ replaceNote }}</p>
      <p v-if="justExcluded" class="note done">✓ {{ justExcluded }} item(s) excluded from future draws. You can re-enable them in the objective/pawn steps.</p>
      <div v-if="!justExcluded" class="exclude-bar">
        <button class="back pill" @click="startExcluding">🔄 Replace / exclude tiles…</button>
      </div>
    </template>
    <SetupRules v-if="expansion" :expansion-id="expansion.id" :expansion-name="expansion.name" />
    <div class="nav">
      <button class="back" @click="restart">↺ Start over</button>
      <button class="big" @click="quickPlay">🎲 Re-roll</button>
    </div>
    <p class="reset">
      <button class="back pill" @click="showToken = true">🪙 Two-player token</button>
    </p>
  </section>
</template>

<style scoped>
.note { text-align: center; }
.exp-col { width: min(100%, 560px); margin: 0 auto 8px; }
.result-items { display: grid; gap: 16px; max-width: calc(3 * var(--size-objective) + 24px); margin: 0 auto; }
.obj-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pawn-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pawn-item h3 {
  display: flex; align-items: center; gap: 8px; margin: 0 0 8px; justify-content: center;
  font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: .22em; text-transform: uppercase; color: var(--navy);
}
.pawn-item h3::before, .pawn-item h3::after {
  content: ''; flex: 1; height: 6px; border-top: 2px solid var(--orange); border-bottom: 2px solid var(--orange); opacity: .8;
}
.exclude-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; padding: 10px 14px;
  border: 2px dashed var(--navy); border-radius: 14px; background: rgba(255,255,255,.6); font-size: .9rem; }
.exclude-bar:has(> .pill:only-child) { border: 0; background: none; padding: 0; justify-content: center; }
.exclude-actions { flex-basis: 100%; display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.exclude-bar .big.small { font-size: 1rem; padding: 6px 20px; box-shadow: 0 3px 0 var(--navy); }
.exclude-bar .big:disabled { opacity: .4; }
.exclude-bar .back { padding: 6px 16px; }
.exclude-bar .back:disabled { opacity: .4; }
.done { color: var(--navy); font-weight: 700; }
.clickable { cursor: pointer; }
.marking { cursor: pointer; }
.mark { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--navy);
  background: #fff; display: grid; place-items: center; font-weight: 800; color: #fff; }
.mark.on { background: #c0392b; }
@media (max-width: 640px) {
  .exp-col { width: auto; margin: -16px -12px 12px; }
  .exp-col :deep(.tile) { border-radius: 0; border-width: 0 0 3px; box-shadow: none; }
  .result-items { gap: 10px; max-width: none; }
  .obj-list { grid-template-columns: 1fr 1fr; gap: 10px; }
  .obj-list > :first-child { grid-column: 1 / -1; justify-self: center; width: calc(50% - 5px); }
  .pawn-row { gap: 8px; }
  .pawn-item h3 { font-size: .75rem; letter-spacing: .12em; gap: 5px; margin-bottom: 6px; }
  .pawn-item .mark { top: 4px; right: 4px; width: 20px; height: 20px; font-size: .7rem; border-width: 2px; }
}
</style>
