<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Tile from './components/Tile.vue'
import SetupRules from './components/SetupRules.vue'
import { CARS, EXPANSIONS, OBJECTIVES, PROMO, SOURCE_COLORS, TRAINS, TRAVELERS, WORLD, type Objective, type Pawn } from './data'
import { persistedRef, persistedSet } from './storage'
import { OBJECTIVE_COUNT, drawObjectives, pick, type Ratio } from './randomizer'

type Step = 'expansions' | 'objectives' | 'pawns' | 'result'
const step = ref<Step>('expansions')

const disabledExpansions = persistedSet('disabledExpansions')
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const world = persistedRef('world', true, isBool)
const promo = persistedRef('promo', true, isBool)
const expansion = ref<(typeof EXPANSIONS)[number] | null>(null)
const ratio = persistedRef<Ratio>('ratio', 1, (v): v is Ratio => v === 'free' || (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= OBJECTIVE_COUNT))
const disabledObjectives = persistedSet('disabledObjectives')
const disabledPawns = persistedSet('disabledPawns')

const ALL_PAWNS = [...TRAVELERS, ...TRAINS, ...CARS]

const pawnGroups = [
  { type: 'car', title: 'Special Car Pawns', pawns: CARS },
  { type: 'train', title: 'Special Train Pawns', pawns: TRAINS },
  { type: 'traveler', title: 'Special Traveler Pawns', pawns: TRAVELERS },
] as const

const result = ref<{ objectives: Objective[]; pawns: Record<string, Pawn> | null } | null>(null)

const toggle = (set: Set<string>, id: string) => (set.has(id) ? set.delete(id) : set.add(id))

const poolSources = computed(() => [
  ...(expansion.value ? [expansion.value] : []),
  { id: 'base', name: 'Base Game' },
  ...(world.value ? [WORLD] : []),
  ...(promo.value ? [PROMO] : []),
])
const objectivesOf = (source: string) => OBJECTIVES.filter((o) => o.source === source)
const isExpansionObjective = (o: Objective) => o.source === expansion.value?.id
const activePool = computed(() => poolSources.value.flatMap((s) => objectivesOf(s.id)).filter((o) => !disabledObjectives.has(o.id)))

const setGroup = (ids: string[], disabled: Set<string>, on: boolean) =>
  ids.forEach((id) => (on ? disabled.delete(id) : disabled.add(id)))

// Ratio is "expansion objectives : other objectives"
const ratios = [
  ...Array.from({ length: OBJECTIVE_COUNT + 1 }, (_, i) => ({ value: i as Ratio, other: OBJECTIVE_COUNT - i, exp: i })),
  { value: 'free' as Ratio, other: 0, exp: 0 },
]

const pawnsReady = computed(() => pawnGroups.every((g) => g.pawns.some((p) => !disabledPawns.has(p.id))))

function drawExpansion() {
  expansion.value = pick(EXPANSIONS.filter((e) => !disabledExpansions.has(e.id)), 1)[0] ?? null
  step.value = 'objectives'
}

function quickPlay() {
  drawExpansion()
  showResult()
}

function nextFromObjectives() {
  if (world.value) step.value = 'pawns'
  else showResult()
}

function showResult() {
  const base = activePool.value.filter((o) => !isExpansionObjective(o))
  const exp = activePool.value.filter(isExpansionObjective)
  result.value = {
    objectives: drawObjectives(base, exp, ratio.value),
    pawns:
      world.value && pawnsReady.value
        ? Object.fromEntries(pawnGroups.map((g) => [g.type, pick(g.pawns.filter((p) => !disabledPawns.has(p.id)), 1)[0]!]))
        : null,
  }
  excluding.value = false
  justExcluded.value = 0
  step.value = 'result'
}

// Result screen: pick drawn items to exclude from future draws (all marked when the mode starts)
const excluding = ref(false)
const marked = reactive(new Set<string>())
const justExcluded = ref(0)
const resultIds = computed(() => [
  ...(result.value?.objectives.map((o) => o.id) ?? []),
  ...Object.values(result.value?.pawns ?? {}).map((p) => p.id),
])

function startExcluding() {
  marked.clear()
  resultIds.value.forEach((id) => marked.add(id)) // expansion is opt-in, so not marked by default
  justExcluded.value = 0
  excluding.value = true
}

function applyExclusions() {
  marked.forEach((id) => {
    if (id === expansion.value?.id) disabledExpansions.add(id)
    else (OBJECTIVES.some((o) => o.id === id) ? disabledObjectives : disabledPawns).add(id)
  })
  justExcluded.value = marked.size
  excluding.value = false
}

// --- URL <-> state (hash routing, so reloads and the back button restore the exact view)
const currentHash = computed(() => {
  const e = expansion.value?.id ?? 'none'
  switch (step.value) {
    case 'objectives':
      return `#/objectives/${e}`
    case 'pawns':
      return `#/pawns/${e}`
    case 'result': {
      const r = result.value
      if (!r) return '#/'
      const pawns = r.pawns ? Object.values(r.pawns).map((p) => p.id).join(',') : '-'
      return `#/result/${e}/${r.objectives.map((o) => o.id).join(',')}/${pawns}`
    }
    default:
      return '#/'
  }
})

function applyHash() {
  const hash = location.hash || '#/'
  if (hash === currentHash.value) return
  const [, route, e, objs, pws] = hash.split('/')
  const exp = e === 'none' ? null : EXPANSIONS.find((x) => x.id === e)
  const valid = e === 'none' || !!exp
  result.value = null
  if (valid && (route === 'objectives' || route === 'pawns')) {
    expansion.value = exp ?? null
    step.value = route
    return
  }
  if (valid && route === 'result' && objs) {
    const objectives = objs.split(',').map((id) => OBJECTIVES.find((o) => o.id === id))
    const pawnList = pws && pws !== '-' ? pws.split(',').map((id) => ALL_PAWNS.find((p) => p.id === id)) : []
    if (objectives.every(Boolean) && pawnList.every(Boolean)) {
      expansion.value = exp ?? null
      result.value = {
        objectives: objectives as Objective[],
        pawns: pawnList.length
          ? Object.fromEntries(
              pawnGroups.flatMap((g) => {
                const p = (pawnList as Pawn[]).find((x) => x.id.startsWith(`${g.type}-`))
                return p ? [[g.type, p]] : []
              }),
            )
          : null,
      }
      excluding.value = false
      justExcluded.value = 0
      step.value = 'result'
      return
    }
  }
  expansion.value = null
  step.value = 'expansions'
}

onMounted(() => {
  applyHash()
  window.addEventListener('hashchange', applyHash)
})
onUnmounted(() => window.removeEventListener('hashchange', applyHash))

watch(currentHash, (h) => {
  if ((location.hash || '#/') !== h) location.hash = h
})

// Only page changes scroll to the top; a re-roll stays where it is
watch(step, () => window.scrollTo(0, 0))

function resetAll() {
  if (!confirm('Reset everything? This re-enables every expansion, objective and pawn, and restores the default settings.')) return
  disabledExpansions.clear()
  disabledObjectives.clear()
  disabledPawns.clear()
  world.value = true
  promo.value = true
  ratio.value = 1
}

function restart() {
  result.value = null
  excluding.value = false
  justExcluded.value = 0
  step.value = 'expansions'
}
</script>

<template>
  <header class="hero">
    <div class="logo">
      <svg viewBox="0 0 600 260" aria-hidden="true">
        <path id="cartouche" class="outer" d="M60,40 H240 Q270,40 300,6 Q330,40 360,40 H540 Q560,40 560,60 Q540,75 540,95 V165 Q540,185 560,200 Q560,220 540,220 H360 Q330,220 300,254 Q270,220 240,220 H60 Q40,220 40,200 Q60,185 60,165 V95 Q60,75 40,60 Q40,40 60,40 Z" />
        <path class="inner" d="M60,40 H240 Q270,40 300,6 Q330,40 360,40 H540 Q560,40 560,60 Q540,75 540,95 V165 Q540,185 560,200 Q560,220 540,220 H360 Q330,220 300,254 Q270,220 240,220 H60 Q40,220 40,200 Q60,185 60,165 V95 Q60,75 40,60 Q40,40 60,40 Z" transform="translate(300 130) scale(.95 .9) translate(-300 -130)" />
      </svg>
      <div class="words">
        <span class="title">Railroad</span>
        <span class="sub">Tiles</span>
        <span class="tagline">Randomizer</span>
      </div>
    </div>
  </header>

  <main>
    <!-- Step 1 -->
    <section v-if="step === 'expansions'" class="panel">
      <h2>
        Which expansions do you own? <small>(click to toggle)</small>
        <span class="links">
          <button class="link" @click="setGroup(EXPANSIONS.map((e) => e.id), disabledExpansions, true)">all</button> /
          <button class="link" @click="setGroup(EXPANSIONS.map((e) => e.id), disabledExpansions, false)">none</button>
        </span>
      </h2>
      <div class="grid exp">
        <button v-for="e in EXPANSIONS" :key="e.id" class="plain" @click="toggle(disabledExpansions, e.id)">
          <Tile :name="e.name" :image="e.image" aspect="2" :color="SOURCE_COLORS[e.id]" :disabled="disabledExpansions.has(e.id)" />
        </button>
      </div>
      <div class="extras">
        <button class="plain" @click="world = !world">
          <Tile :name="WORLD.name" :image="WORLD.image" aspect="2" :color="SOURCE_COLORS.world" :disabled="!world" :tag="world ? 'On' : 'Off'" />
        </button>
        <button class="plain" @click="promo = !promo">
          <Tile :name="PROMO.name" :image="PROMO.image" aspect="2" :disabled="!promo" :tag="promo ? 'On' : 'Off'" />
        </button>
        <p class="note">
          The World expansion adds objectives and lets you randomize the special pawns. The promo pack adds 2 objectives.
        </p>
      </div>
      <div class="nav">
        <button class="quick" title="Draw immediately with your saved settings" @click="quickPlay">⚡ Quick play</button>
        <button class="big" @click="drawExpansion">Next ▶</button>
      </div>
      <p class="reset">
        <button class="link" @click="resetAll">Reset all settings</button>
        <small>— re-enables every expansion, objective and pawn</small>
      </p>
    </section>

    <!-- Step 2 -->
    <section v-else-if="step === 'objectives'" class="panel bleed">
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
      <div v-for="s in poolSources" :key="s.id" class="group">
        <h3>
          {{ s.name }}
          <span class="links">
            <button class="link" @click="setGroup(objectivesOf(s.id).map((o) => o.id), disabledObjectives, true)">all</button> /
            <button class="link" @click="setGroup(objectivesOf(s.id).map((o) => o.id), disabledObjectives, false)">none</button>
          </span>
        </h3>
        <div class="grid obj">
          <button v-for="o in objectivesOf(s.id)" :key="o.id" class="plain" @click="toggle(disabledObjectives, o.id)">
            <Tile :name="o.name" :image="o.image" aspect="1" :color="SOURCE_COLORS[o.source]" :disabled="disabledObjectives.has(o.id)" />
          </button>
        </div>
      </div>
      <div class="nav">
        <button class="back" @click="step = 'expansions'">◀ Back</button>
        <button class="big" @click="nextFromObjectives">Next ▶</button>
      </div>
    </section>

    <!-- Step 3 -->
    <section v-else-if="step === 'pawns'" class="panel bleed">
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
          <button v-for="p in g.pawns" :key="p.id" class="plain" @click="toggle(disabledPawns, p.id)">
            <Tile :name="p.name" :image="p.image" aspect="17/9" :disabled="disabledPawns.has(p.id)" />
          </button>
        </div>
      </div>
      <p v-if="!pawnsReady" class="note warn">Select at least one pawn of each type to have pawns randomized.</p>
      <div class="nav">
        <button class="back" @click="step = 'objectives'">◀ Back</button>
        <button class="big" @click="showResult">Next ▶</button>
      </div>
    </section>

    <!-- Result -->
    <section v-else-if="result" class="panel bleed result">
      <div v-if="expansion" class="exp-col">
        <button class="plain" :class="{ marking: excluding }" :disabled="!excluding" @click="toggle(marked, expansion.id)">
          <Tile :name="expansion.name" :image="expansion.image" aspect="2" :color="SOURCE_COLORS[expansion.id]" :selected="!excluding" :disabled="marked.has(expansion.id) && excluding" />
          <span v-if="excluding" class="mark" :class="{ on: marked.has(expansion.id) }">{{ marked.has(expansion.id) ? '✕' : '' }}</span>
        </button>
      </div>
      <p v-else class="note">No expansion enabled — playing the base game.</p>
      <h2>Your game</h2>
      <div class="result-items">
        <div class="obj-list">
          <button v-for="o in result.objectives" :key="o.id" class="plain" :class="{ marking: excluding }"
            :disabled="!excluding" @click="toggle(marked, o.id)">
            <Tile :name="o.name" :image="o.image" aspect="1" :color="SOURCE_COLORS[o.source]" :selected="!excluding" :disabled="marked.has(o.id) && excluding"
              :tag="o.source === 'base' ? '' : o.source" :tag-color="SOURCE_COLORS[o.source]" />
            <span v-if="excluding" class="mark" :class="{ on: marked.has(o.id) }">{{ marked.has(o.id) ? '✕' : '' }}</span>
          </button>
        </div>
        <div v-if="result.pawns" class="pawn-row">
          <div v-for="(p, type) in result.pawns" :key="type" class="pawn-item">
            <h3>{{ type }}</h3>
            <button class="plain" :class="{ marking: excluding }" :disabled="!excluding" @click="toggle(marked, p.id)">
              <Tile :name="p.name" :image="p.image" aspect="17/9" :selected="!excluding" :disabled="marked.has(p.id) && excluding" />
              <span v-if="excluding" class="mark" :class="{ on: marked.has(p.id) }">{{ marked.has(p.id) ? '✕' : '' }}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="excluding" class="exclude-bar">
        <span>Marked items won't be drawn again. Click a tile to toggle it ({{ marked.size }} marked). The expansion is not marked by default.</span>
        <button class="link" @click="[...resultIds, ...(expansion ? [expansion.id] : [])].forEach((id) => marked.add(id))">all</button> /
        <button class="link" @click="marked.clear()">none</button>
        <div class="exclude-actions">
          <button class="back" @click="excluding = false">Cancel</button>
          <button class="big small" :disabled="!marked.size" @click="applyExclusions">Exclude {{ marked.size }}</button>
        </div>
      </div>
      <p v-else-if="justExcluded" class="note done">✓ {{ justExcluded }} item(s) excluded from future draws. You can re-enable them in the objective/pawn steps.</p>
      <div v-else class="exclude-bar">
        <button class="back pill" @click="startExcluding">🚫 Don't draw these again…</button>
      </div>
      <SetupRules v-if="expansion" :expansion-id="expansion.id" :expansion-name="expansion.name" />
      <div class="nav">
        <button class="back" @click="restart">↺ Start over</button>
        <button class="big" @click="showResult">🎲 Re-roll</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero { padding: 20px 12px 8px; display: grid; place-items: center; }
.logo { position: relative; width: min(520px, 92vw); aspect-ratio: 600 / 260; container-type: inline-size; filter: drop-shadow(0 5px 0 rgba(217, 138, 61, .55)); }
.logo svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.outer { fill: #fff; stroke: var(--navy); stroke-width: 3; stroke-linejoin: round; }
.inner { fill: none; stroke: var(--blue); stroke-width: 1.5; stroke-linejoin: round; }
.words { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; gap: 1.5cqw; }
.title { font-family: 'Limelight', Georgia, serif; font-size: 10.5cqw; color: var(--navy); text-transform: uppercase; letter-spacing: .02em; }
.sub { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: var(--orange); font-size: 7.5cqw; letter-spacing: .06em; text-transform: uppercase; }
.tagline { font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 2.6cqw; letter-spacing: .45em; margin-right: -.45em; color: var(--blue); text-transform: uppercase; }
main { max-width: 1100px; margin: 0 auto; padding: 12px 16px 60px; display: grid; gap: 20px; }
.panel { background: rgba(255,255,255,.7); border: 3px solid var(--navy); border-radius: 18px; padding: 16px 20px;
  box-shadow: 0 5px 0 var(--brick-light); }
h2 { margin: 0 0 12px; } h2 small { font-weight: 400; font-size: .75rem; opacity: .7; }
h3 { margin: 12px 0 8px; text-transform: capitalize; }
.grid { display: grid; gap: 12px; }
.exp { grid-template-columns: repeat(auto-fill, minmax(var(--size-expansion), 1fr)); }
.obj { grid-template-columns: repeat(auto-fill, minmax(var(--size-objective), 1fr)); }
.extras { display: grid; grid-template-columns: var(--size-expansion) var(--size-expansion) 1fr; gap: 12px; margin-top: 16px; align-items: center; }
.plain { background: none; border: 0; padding: 0; text-align: inherit; color: inherit; }
.plain:hover :deep(.tile) { transform: translateY(-3px); }
.note { font-size: .85rem; opacity: .8; }
.ratios { display: flex; gap: 12px; flex-wrap: wrap; }
.chip { display: grid; padding: 10px 18px; border: 3px solid var(--navy); border-radius: 14px; background: var(--cream);
  color: var(--navy); text-align: center; }
.chip span { font-size: .75rem; }
.chip.on { background: var(--navy); color: #fff; }
.links { font-size: .75rem; font-weight: 400; margin-left: 8px; }
.link { background: none; border: 0; color: var(--blue); text-decoration: underline; padding: 0; }
.nav { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 12px; }
.nav .big:only-child { margin-left: auto; }
/* Navigation buttons stay at the bottom of the screen */
.nav { position: sticky; bottom: 0; z-index: 10; margin: 16px -20px -16px; padding: 10px 20px 14px;
  background: rgba(251, 248, 238, .96); border-top: 3px solid var(--navy); border-radius: 0 0 14px 14px; }
.back { font-weight: 700; padding: 10px 22px; border-radius: 30px; border: 3px solid var(--navy); background: var(--cream); color: var(--navy); }
.topbar { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.picked { width: 200px; }
.ratio h3 { margin: 0 0 6px; font-size: .95rem; } .ratio h3 small { font-weight: 400; opacity: .7; }
.ratio .chip { padding: 4px 14px; font-weight: 700; }
.ratio .note { margin: 6px 0 0; }
.exclude-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; padding: 10px 14px;
  border: 2px dashed var(--navy); border-radius: 14px; background: rgba(255,255,255,.6); font-size: .9rem; }
.exclude-bar:has(> .pill:only-child) { border: 0; background: none; padding: 0; justify-content: center; }
.pill { font-size: .85rem; padding: 6px 16px; border-width: 2px; box-shadow: 0 3px 0 var(--navy); }
.exclude-actions { flex-basis: 100%; display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.exclude-bar .big.small { font-size: 1rem; padding: 6px 20px; box-shadow: 0 3px 0 var(--navy); }
.exclude-bar .big:disabled { opacity: .4; }
.exclude-bar .back { padding: 6px 16px; }
.done { color: var(--navy); font-weight: 700; }
.plain { position: relative; }
.marking { cursor: pointer; }
.mark { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--navy);
  background: #fff; display: grid; place-items: center; font-weight: 800; color: #fff; }
.mark.on { background: #c0392b; }
.quick { font-weight: 800; font-size: 1.1rem; padding: 10px 24px; border-radius: 30px; border: 3px solid var(--navy);
  background: var(--cream); color: var(--navy); box-shadow: 0 4px 0 var(--navy); }
.quick:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--navy); }
.quick + .big { margin-left: auto; }
.reset { margin: 16px 0 0; text-align: center; font-size: .8rem; opacity: .85; }
.warn { color: var(--orange); font-weight: 700; }
.pawn { grid-template-columns: repeat(auto-fill, minmax(var(--size-pawn), 1fr)); }
.big { font-size: 1.5rem; font-weight: 800; padding: 14px 40px; border-radius: 40px; border: 3px solid var(--navy);
  background: var(--orange); color: #fff; box-shadow: 0 6px 0 var(--navy); }
.big:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--navy); }
/* Result page: objectives in one row, pawns in one row underneath (mobile uses a pyramid, see below) */
.exp-col { width: min(100%, 560px); margin: 0 auto 8px; }
.result-items { display: grid; gap: 16px; max-width: calc(3 * var(--size-objective) + 24px); margin: 0 auto; }
.obj-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pawn-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pawn-item h3 { margin: 0 0 4px; font-size: .85rem; }
@media (max-width: 640px) {
  .extras { grid-template-columns: 1fr 1fr; } .note { grid-column: 1 / -1; }

  /* Selection and result pages: edge-to-edge panels with a full-width expansion banner */
  .panel.bleed { margin: 0 -16px; border-width: 3px 0; border-radius: 0; padding: 16px 12px; }
  .picked, .exp-col { width: auto; margin: -16px -12px 12px; }
  .picked :deep(.tile), .exp-col :deep(.tile) { border-radius: 0; border-width: 0 0 3px; box-shadow: none; }
  .topbar { display: grid; gap: 4px; }

  .bleed .nav { margin: 16px -12px -16px; padding: 10px 12px 14px; border-radius: 0; }
  .nav .big { font-size: 1.25rem; padding: 10px 28px; }
  .nav .back, .nav .quick { padding: 8px 18px; }

  .bleed .obj { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .bleed .pawn { grid-template-columns: repeat(3, 1fr); gap: 8px; }

  .ratios { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .ratio .chip { padding: 8px 0; border-radius: 12px; }

  .result-items { gap: 10px; max-width: none; }
  .obj-list { grid-template-columns: 1fr 1fr; gap: 10px; }
  .obj-list > :first-child { grid-column: 1 / -1; justify-self: center; width: calc(50% - 5px); }
  .pawn-row { gap: 8px; }
  .pawn-item h3 { font-size: .7rem; }
  .pawn-item .mark { top: 4px; right: 4px; width: 20px; height: 20px; font-size: .7rem; border-width: 2px; }
}

@media (max-width: 379px) {
  .bleed .obj { grid-template-columns: 1fr; }
  .bleed .pawn { grid-template-columns: repeat(2, 1fr); }
  .ratios { grid-template-columns: repeat(3, 1fr); }
}
</style>
