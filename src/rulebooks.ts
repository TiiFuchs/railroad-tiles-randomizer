// Rulebook PDFs are discovered automatically: put <expansion-id>.pdf into src/assets/rulebooks/.
const files = import.meta.glob('./assets/rulebooks/*.pdf', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

const RULEBOOKS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.pdf$/, ''), url]),
)

export const rulebookFor = (id: string): string | undefined => RULEBOOKS[id]

/** Large screens with a mouse get an in-page popup; everything else opens a new tab. */
export const prefersPopup = () => window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches
