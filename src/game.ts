import { computed, onMounted, onUnmounted, reactive, ref, watch, inject, provide, type InjectionKey } from 'vue'
import { prefersPopup, rulebookFor } from './rulebooks'
import { RULES } from './rules'
import { CARS, EXPANSIONS, OBJECTIVES, PROMO, TRAINS, TRAVELERS, WORLD, type Objective, type Pawn } from './data'
import { persistedRef, persistedSet } from './storage'
import { OBJECTIVE_COUNT, drawObjectives, pick, type Ratio } from './randomizer'

/** All app state and logic (wizard steps, settings, drawing, exclusions, hash routing). Created once in App.vue and shared via provide/inject. */
export function createGame() {
  type Step = 'expansions' | 'objectives' | 'pawns' | 'result'
  const step = ref<Step>('expansions')
  const showToken = ref(false)
  const side = persistedRef<'front' | 'back'>('objectiveSide', 'back', (v): v is 'front' | 'back' => v === 'front' || v === 'back')
  const objImage = (o: Objective) => (side.value === 'back' ? o.backImage : o.image)

  const info = ref<{ name: string; image: string; backImage?: string; text: string; aspect: string; color?: string } | null>(null)
  const rulebook = ref<{ title: string; url: string } | null>(null)
  const openRulebook = (id: string, title: string) => {
    const url = rulebookFor(id)
    if (!url) return
    if (prefersPopup()) rulebook.value = { title, url }
    else window.open(url, '_blank', 'noopener')
  }
  const hasRules = (id: string) => !!RULES[id]
  const openInfo = (item: { id: string; name: string; image: string }, aspect: string, color?: string) => {
    if (RULES[item.id]) info.value = { name: item.name, image: item.image, backImage: (item as Partial<Objective>).backImage, text: RULES[item.id]!, aspect, color }
  }

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
    replaced.value = 0
    replaceNote.value = ''
    step.value = 'result'
  }

  // Result screen: pick drawn items to exclude from future draws (all marked when the mode starts)
  const excluding = ref(false)
  const marked = reactive(new Set<string>())
  const justExcluded = ref(0)
  const replaced = ref(0)
  const expansionMarked = computed(() => !!expansion.value && marked.has(expansion.value.id))
  const replaceNote = ref('')
  const resultIds = computed(() => [
    ...(result.value?.objectives.map((o) => o.id) ?? []),
    ...Object.values(result.value?.pawns ?? {}).map((p) => p.id),
  ])

  function startExcluding() {
    marked.clear()
    justExcluded.value = 0
    replaced.value = 0
    replaceNote.value = ''
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

  // Excludes the marked tiles and draws substitutes for them (the expansion is never replaced)
  function replaceMarked() {
    const r = result.value
    if (!r || !marked.size || (expansion.value && marked.has(expansion.value.id))) return
    const count = marked.size
    const missed: string[] = []
    const ids = new Set(marked)
    applyExclusions()
    const taken = new Set(r.objectives.map((o) => o.id))
    r.objectives = r.objectives.map((o) => {
      if (!ids.has(o.id)) return o
      const sameKind = (c: Objective) => ratio.value === 'free' || isExpansionObjective(c) === isExpansionObjective(o)
      const sub = pick(activePool.value.filter((c) => !taken.has(c.id) && sameKind(c)), 1)[0]
      if (!sub) { missed.push(o.name); return o }
      taken.add(sub.id)
      return sub
    })
    if (r.pawns) {
      for (const [type, p] of Object.entries(r.pawns)) {
        if (!ids.has(p.id)) continue
        const group = pawnGroups.find((g) => g.type === type)!
        const sub = pick(group.pawns.filter((c) => !disabledPawns.has(c.id)), 1)[0]
        if (sub) r.pawns[type] = sub
        else missed.push(p.name)
      }
    }
    justExcluded.value = 0
    replaced.value = count - missed.length
    replaceNote.value = missed.length ? `No more tiles available to replace: ${missed.join(', ')}.` : ''
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
        replaced.value = 0
        replaceNote.value = ''
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
    replaced.value = 0
    replaceNote.value = ''
    step.value = 'expansions'
  }

  return {
    step,
    showToken,
    side,
    objImage,
    info,
    rulebook,
    openRulebook,
    hasRules,
    openInfo,
    disabledExpansions,
    world,
    promo,
    expansion,
    ratio,
    disabledObjectives,
    disabledPawns,
    pawnGroups,
    result,
    toggle,
    poolSources,
    objectivesOf,
    setGroup,
    ratios,
    pawnsReady,
    drawExpansion,
    quickPlay,
    nextFromObjectives,
    showResult,
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
    resetAll,
    restart,
  }
}

export type Game = ReturnType<typeof createGame>
const KEY: InjectionKey<Game> = Symbol('game')
export const provideGame = (game: Game) => provide(KEY, game)
export const useGame = (): Game => {
  const game = inject(KEY)
  if (!game) throw new Error('useGame() needs provideGame() in a parent component')
  return game
}
