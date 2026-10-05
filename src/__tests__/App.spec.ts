import { describe, it, expect } from 'vitest'
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
})
