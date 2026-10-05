import { reactive, ref, watch, type Ref } from 'vue'

const KEY = 'railroad-tiles-randomizer:v1'

type Saved = Record<string, unknown>

const load = (): Saved => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const save = (name: string, value: unknown) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...load(), [name]: value }))
  } catch {
    // storage unavailable (private mode / quota): keep working in memory
  }
}

/** A set of disabled ids, persisted. Nothing saved means everything is active. */
export function persistedSet(name: string): Set<string> {
  const raw = load()[name]
  const set = reactive(new Set<string>(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []))
  watch(set, () => {
    save(name, [...set])
  })
  return set
}

export function persistedRef<T>(name: string, fallback: T, valid: (v: unknown) => v is T): Ref<T> {
  const stored = load()[name]
  const r = ref(valid(stored) ? stored : fallback) as Ref<T>
  watch(r, (v) => {
    save(name, v)
  })
  return r
}
