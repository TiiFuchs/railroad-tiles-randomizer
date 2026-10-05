import type { Objective } from './data'

/** Number of objectives drawn from the expansion (0-3), or 'free' for no enforced ratio. */
export type Ratio = number | 'free'
export const OBJECTIVE_COUNT = 3

export const pick = <T>(items: T[], n: number, rng = Math.random): T[] => {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a.slice(0, n)
}

/**
 * Draws objectives. `expansionPool` holds objectives of the chosen expansion,
 * `basePool` those of base game / World / promo (as enabled). `ratio` is the
 * number of expansion objectives. If a pool is too small the remainder is filled from the other.
 */
export function drawObjectives(
  basePool: Objective[],
  expansionPool: Objective[],
  ratio: Ratio,
  rng = Math.random,
): Objective[] {
  if (ratio === 'free') return pick([...basePool, ...expansionPool], OBJECTIVE_COUNT, rng)
  const wantExp = ratio
  const exp = pick(expansionPool, wantExp, rng)
  const base = pick(basePool, OBJECTIVE_COUNT - exp.length, rng)
  const rest = pick(
    [...basePool, ...expansionPool].filter((o) => !exp.includes(o) && !base.includes(o)),
    OBJECTIVE_COUNT - exp.length - base.length,
    rng,
  )
  return [...exp, ...base, ...rest]
}
