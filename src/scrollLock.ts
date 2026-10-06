import { onMounted, onUnmounted } from 'vue'

let locks = 0
let scrollY = 0

// Fixing the body is the only approach that also stops background scrolling on iOS Safari
function lock() {
  if (locks++ > 0) return
  scrollY = window.scrollY
  const { style } = document.body
  style.position = 'fixed'
  style.top = `-${scrollY}px`
  style.left = '0'
  style.right = '0'
  document.documentElement.style.overscrollBehavior = 'none'
}

function unlock() {
  if (--locks > 0) return
  const { style } = document.body
  style.position = style.top = style.left = style.right = ''
  document.documentElement.style.overscrollBehavior = ''
  window.scrollTo(0, scrollY)
}

/** Blocks page scrolling while the calling component is mounted (use in popups). */
export function useScrollLock() {
  onMounted(lock)
  onUnmounted(unlock)
}
