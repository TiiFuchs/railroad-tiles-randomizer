<div align="center">

# 🚂 Railroad Tiles Randomizer

**Can't decide which expansion, objectives or pawns to play with? Let the tracks decide.**

A small, fully static web app for the board game *Railroad Tiles* by Hjalmar Hach & Lorenzo Silva.

</div>

---

## ✨ What it does

Setting up *Railroad Tiles* with its many expansions means a lot of choices. This randomizer makes them for you, in four quick steps:

### 1. 🗺️ Pick what you own
All seven expansions are shown as covers: **Canals, Countryside, Desert, Energy, Forest, Lakes and Monuments**. Click a cover to turn off the ones you don't own. The **World** expansion and the **Hospital & Local Market** promo pack have their own on/off toggles.

Press **Next** and one of your enabled expansions is drawn at random.

In a hurry? **⚡ Quick play** draws everything at once using your saved settings and jumps straight to the result.

### 2. 🎯 Shape the objectives
You'll see every objective available for your game: base game, World (if on), the promo pack (if on) and the drawn expansion. All are selected at first. Click any tile to leave it out.

At the top, choose the **ratio** of objectives: *expansion : other*. Every combination of the 3 objectives is available:

| Ratio | Meaning |
|-------|---------|
| `0:3` | all three from the base game / World / promo |
| `1:2` | one from the expansion, two from the rest |
| `2:1` | two from the expansion, one from the rest |
| `3:0` | all three from the expansion |
| `Free` | any three from the whole pool |

### 3. 🚗 Choose your special pawns *(World expansion only)*
If you play with World, pick which **traveler, train and car** pawns are in the pool. Each type has quick *all / none* links. If you don't use World, this step is skipped.

### 4. 🎲 Your game
You get your expansion, three objectives and, with World, one pawn of each type. Don't like it? **Re-roll** or **Start over**.

## 🧠 It remembers you

Your choices are saved in your browser, so you only set things up once:

- Expansions, objectives and pawns you turned off stay off.
- World, promo and ratio settings are kept.
- On the result screen, use **"Don't draw these again…"** to pick drawn objectives, pawns (and optionally the expansion) to leave out next time. Perfect for working through every objective over several games.
- Changed your mind? **Reset all settings** on the first page re-enables every expansion, objective and pawn.

Nothing is sent anywhere. It all stays in your browser's local storage.

---

## 🛠️ For developers

Built with [Vue](https://vuejs.org/) and [Vite](https://vite.dev/).

```bash
npm install
npm run dev          # start the dev server
npm run test:unit    # run the tests
npm run build        # production build into dist/
```

### Customizing

- **Names, objectives, pawns:** edit `src/data.ts`.
- **Expansion pill colors:** edit `SOURCE_COLORS` in `src/data.ts`.
- **Tile sizes:** change `--size-expansion`, `--size-objective` and `--size-pawn` in `src/style.css`.
- **Expansion setup rules:** edit the steps (1–3 per expansion, `**bold**` supported) in `src/setup-rules.ts`.
- **Artwork:** drop images into `public/images/`. Missing images fall back to a placeholder.

| Folder | File name | Format |
|--------|-----------|--------|
| `expansions/` | `<id>.png`, e.g. `desert.png`, `world.png`, `promo.png` | 2:1 landscape (e.g. 800×400) |
| `objectives/` | `<source>-<name>.png`, e.g. `base-city-hall.png`, `canals-doges-tower.png` | square |
| `pawns/` | `<type>-<name>.png`, e.g. `car-tow-truck.png`, `traveler-police-officer.png` | 17:9 landscape (e.g. 680×360) |
| `setup/` | `<expansion-id>.png`, e.g. `desert.png` | any ratio, about 720 px wide |

Names are lowercase and hyphenated, with apostrophes dropped.

Use full-size originals: `npm run build` automatically downscales the copies in `dist/` (expansions 600 px wide, objectives and pawns 400 px; smaller images are never enlarged) via `scripts/optimize-images.mjs`. Your files in `public/images/` are never modified. If you change the tile sizes in `src/style.css`, adjust the widths in that script too.

### 🚀 Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) tests, builds and publishes the site to GitHub Pages on every push to `main`. Set **Settings → Pages → Source** to **GitHub Actions**.

---

<div align="center">

*Unofficial fan project, not affiliated with Horrible Guild or the game's authors. Railroad Tiles and its artwork belong to their respective owners.*

</div>
