// Precaches the whole app (all files listed at build time) on install, so it works fully offline.
// scripts/precache.mjs fills in VERSION and PRECACHE in dist/sw.js; in dev they stay empty.
const VERSION = '__BUILD_VERSION__'
const PRECACHE = []
const CACHE = `rtr-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

// If any download fails the install fails, and the browser retries on the next visit
async function precache() {
  const cache = await caches.open(CACHE)
  const urls = ['./', ...PRECACHE].map((p) => new URL(p, self.location).href)
  for (let i = 0; i < urls.length; i += 8) {
    await Promise.all(urls.slice(i, i + 8).map((u) => cache.add(new Request(u, { cache: 'reload' }))))
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin || req.headers.has('range')) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' })
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone())
          return res
        })
        .catch(() => undefined)
      // Hashed build assets never change, so the cache wins; everything else refreshes in the background
      if (cached) {
        if (!url.pathname.includes('/assets/')) event.waitUntil(network)
        return cached
      }
      return (await network) ?? (req.mode === 'navigate' ? cache.match(new URL('./', self.location).href) : undefined) ?? Response.error()
    }),
  )
})
