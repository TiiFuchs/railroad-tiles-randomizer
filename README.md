# Railroad Tiles Randomizer

`npm run dev` to start. Edit names/counts in `src/data.ts`.
Drop scans into `public/images/` (missing images fall back to placeholders). File names are the
lowercase, hyphenated name: `expansions/<id>.png` (desert, countryside, …, world, promo),
`objectives/<source>-<name>.png` (e.g. `base-city-hall.png`, `world-theme-park.png`, `canals-doges-tower.png`),
`pawns/<type>-<name>.png` (e.g. `car-tow-truck.png`, `traveler-police-officer.png`).

Tile sizes: change `--size-expansion`, `--size-objective`, `--size-pawn` in `src/style.css`.

Expansion images (incl. world and promo) are 2:1 landscape, e.g. 800×400 px. Objectives are square; pawns are 17:9 landscape (e.g. 680×360 px).
