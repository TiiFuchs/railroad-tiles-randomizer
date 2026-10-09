// Post-build step: lists every file in dist/ in dist/sw.js so the service worker can precache the whole app.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, relative, sep } from 'node:path'

const dist = join(import.meta.dirname, '..', 'dist')
const files = []
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await walk(path)
    else files.push(relative(dist, path).split(sep).join('/'))
  }
}
await walk(dist)

const list = files.filter((f) => f !== 'sw.js' && f !== 'index.html' && !f.endsWith('.DS_Store')).sort()
const hash = createHash('sha1')
for (const f of list) hash.update(f).update(await readFile(join(dist, f)))

const swPath = join(dist, 'sw.js')
let sw = await readFile(swPath, 'utf8')
sw = sw.replace("'__BUILD_VERSION__'", `'${hash.digest('hex').slice(0, 10)}'`).replace('const PRECACHE = []', `const PRECACHE = ${JSON.stringify(list)}`)
await writeFile(swPath, sw)
console.log(`Precache list: ${list.length} files`)
