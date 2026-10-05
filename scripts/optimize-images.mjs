// Post-build step: shrinks the images copied into dist/images. Originals in public/images stay untouched.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

// Target widths in px (roughly 2x the largest displayed size, for high-DPI screens). Keep in sync with src/style.css.
const WIDTHS = { expansions: 600, objectives: 400, pawns: 400, setup: 800 }
const root = join(import.meta.dirname, '..', 'dist', 'images')

let before = 0
let after = 0

for (const [folder, width] of Object.entries(WIDTHS)) {
  const dir = join(root, folder)
  if (!existsSync(dir)) continue
  for (const file of await readdir(dir)) {
    if (extname(file).toLowerCase() !== '.png') continue
    const path = join(dir, file)
    const input = await readFile(path)
    const output = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer()
    before += input.length
    // Never make a file bigger than the original
    const smaller = output.length < input.length ? output : input
    after += smaller.length
    await writeFile(path, smaller)
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2)
console.log(`Images optimized: ${mb(before)} MB -> ${mb(after)} MB`)
