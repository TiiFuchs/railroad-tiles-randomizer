import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { EXPANSIONS, OBJECTIVES, CARS } from '../data'
import { drawObjectives } from '../randomizer'

describe('randomizer', () => {
  const base = OBJECTIVES.filter((o) => o.source === 'base')
  const exp = OBJECTIVES.filter((o) => o.source === 'desert')
  it.each([0, 1, 2, 3])('honors ratio %i', (n) => {
    for (let i = 0; i < 30; i++) {
      const r = drawObjectives(base, exp, n)
      expect(r).toHaveLength(3)
      expect(r.filter((o) => o.source === 'desert')).toHaveLength(n)
    }
  })
  it('fills from other pool when one is short', () => {
    expect(drawObjectives(base, [], 2)).toHaveLength(3)
  })
})

describe('data', () => {
  it('is sorted alphabetically', () => {
    const names = EXPANSIONS.map((e) => e.name)
    expect(names).toEqual([...names].sort())
    expect(CARS.map((c) => c.name)).toEqual([...CARS.map((c) => c.name)].sort())
  })
})

describe('App wizard', () => {
  beforeEach(() => {
    const data = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    })
  })
  const next = (w: ReturnType<typeof mount>) => w.find('button.big').trigger('click')
  it('goes expansions -> objectives -> pawns -> result with World', async () => {
    const w = mount(App)
    await next(w)
    expect(w.text()).toContain('Objective ratio')
    await next(w)
    expect(w.text()).toContain('Special pawns')
    await next(w)
    expect(w.text()).toContain('Your game')
    expect(w.text()).toContain('traveler')
  })
  it('skips pawns without World', async () => {
    const w = mount(App)
    await w.findAll('button.plain')[EXPANSIONS.length]!.trigger('click')
    await next(w)
    await next(w)
    expect(w.text()).toContain('Your game')
    expect(w.text()).not.toContain('Special pawns')
  })
  it('persists deselections', async () => {
    const w = mount(App)
    await w.findAll('button.plain')[0]!.trigger('click')
    await w.findAll('button.plain')[EXPANSIONS.length]!.trigger('click')
    await new Promise((r) => setTimeout(r))
    const saved = JSON.parse(localStorage.getItem('railroad-tiles-randomizer:v1')!)
    expect(saved.disabledExpansions).toEqual([EXPANSIONS[0]!.id])
    expect(saved.world).toBe(false)
  })
  it('excludes drawn items from the result screen', async () => {
    const w = mount(App)
    await next(w)
    await next(w)
    await next(w)
    const link = w.findAll('button.link').find((b) => b.text().includes("Don't draw"))!
    await link.trigger('click')
    expect(w.text()).toContain('6 marked')
    await w.findAll('button.back').find((b) => b.text() === 'Cancel')!.trigger('click')
    await w.findAll('button.link').find((b) => b.text().includes("Don't draw"))!.trigger('click')
    await w.find('button.big.small').trigger('click')
    await new Promise((r) => setTimeout(r))
    const saved = JSON.parse(localStorage.getItem('railroad-tiles-randomizer:v1')!)
    expect(saved.disabledObjectives).toHaveLength(3)
    expect(saved.disabledPawns).toHaveLength(3)
  })
  it('can also exclude the expansion', async () => {
    const w = mount(App)
    await next(w)
    await next(w)
    await next(w)
    await w.findAll('button.link').find((b) => b.text().includes("Don't draw"))!.trigger('click')
    expect(w.text()).toContain('6 marked')
    await w.find('.exp-col button.plain').trigger('click')
    expect(w.text()).toContain('7 marked')
    await w.find('button.big.small').trigger('click')
    await new Promise((r) => setTimeout(r))
    const saved = JSON.parse(localStorage.getItem('railroad-tiles-randomizer:v1')!)
    expect(saved.disabledExpansions).toHaveLength(1)
  })
  it('resets all settings', async () => {
    vi.stubGlobal('confirm', () => true)
    const w = mount(App)
    await w.findAll('button.plain')[0]!.trigger('click')
    await w.findAll('button.plain')[EXPANSIONS.length]!.trigger('click')
    await w.findAll('button.link').find((b) => b.text() === 'Reset all settings')!.trigger('click')
    await new Promise((r) => setTimeout(r))
    const saved = JSON.parse(localStorage.getItem('railroad-tiles-randomizer:v1')!)
    expect(saved.disabledExpansions).toEqual([])
    expect(saved.world).toBe(true)
  })
})
