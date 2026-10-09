// Production builds ship WebP copies (see scripts/optimize-images.mjs); in dev the original PNGs are served.
export const imageUrl = (path: string) => (import.meta.env.PROD ? path.replace(/\.png$/, '.webp') : path)
