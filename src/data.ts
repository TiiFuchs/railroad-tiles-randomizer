// Replace placeholder names and drop scans into public/images/... (see README) to customize.
export type Source = 'base' | 'world' | 'promo' | string

export interface Expansion { id: string; name: string; image: string }
export interface Objective { id: string; name: string; source: Source; image: string; backImage: string }
export interface Pawn { id: string; name: string; image: string }

const byName = <T extends { name: string }>(items: T[]) => [...items].sort((a, b) => a.name.localeCompare(b.name))

const slug = (name: string) =>
  name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const EXPANSIONS: Expansion[] = byName(['Desert', 'Countryside', 'Monuments', 'Energy', 'Forest', 'Lakes', 'Canals'].map(
  (name) => ({ id: slug(name), name, image: `images/expansions/${slug(name)}.png` }),
))

export const WORLD = { id: 'world', name: 'World', image: 'images/expansions/world.png' }
export const PROMO = { id: 'promo', name: 'Hospital & Local Market', image: 'images/expansions/promo.png' }

// Pill colors per source id (shown on drawn objectives). Edit here; sources not listed use the default orange.
export const SOURCE_COLORS: Record<string, string> = {
  world: '#005489',
  canals: '#415D71',
  countryside: '#367E45',
  desert: '#EAA02F',
  energy: '#52588E',
  monuments: '#772C23',
  forest: '#E16A21',
  lakes: '#3C6BB0',
}

const make = (source: Source, names: string[]): Objective[] =>
  byName(names.map((name) => ({
    id: `${source}-${slug(name)}`,
    name,
    source,
    image: `images/objectives/${source}-${slug(name)}.png`,
    backImage: `images/objectives/${source}-${slug(name)}-back.png`,
  })))

export const OBJECTIVES: Objective[] = [
  ...make('base', ['City Hall', 'Metropolis', 'Central Station', 'Stadium', 'Airport', 'Temple', 'Gas Station']),
  ...make('world', [
    'Swamp', 'Junkyard', 'Factory', 'Hotel', 'Theme Park', 'Observatory', 'Quarry', 'Cemetery', 'Military Base',
    'Racing Stands',
  ]),
  ...make('promo', ['Hospital', 'Local Market']),
  ...make('countryside', ['Windmill', 'Vineyard', 'Hills']),
  ...make('desert', ['Desert Temple', 'Desert Market', 'Great Oasis']),
  ...make('monuments', ['Museum', 'Royal Gardens', 'Castle']),
  ...make('energy', ['Laboratory', 'Solar Farm', 'Casino']),
  ...make('forest', ["Witch's House", 'Campgrounds', 'Nature Reserve']),
  ...make('canals', ['Tourist Plaza', 'Watermill', "Doge's Tower"]),
  ...make('lakes', ['Lighthouse', 'Fisher Island', 'Hydroelectric Plant']),
]

const pawns = (type: string, names: string[]): Pawn[] =>
  byName(names.map((name) => ({ id: `${type}-${slug(name)}`, name, image: `images/pawns/${type}-${slug(name)}.png` })))

export const TRAVELERS = pawns('traveler', ['Family', 'Mechanic', 'Police Officer', 'Mayor', 'Tourist', 'Thief', 'Dog'])
export const TRAINS = pawns('train', ['Steam Train', 'Circus Wagon', 'Light Rail', 'Crane Wagon', 'Cargo Wagon', 'Bullet Train'])
export const CARS = pawns('car', ['Racing Car', 'Tractor', 'Tow Truck', 'Cement Mixer', 'Bus', 'Off-Road Vehicle'])
