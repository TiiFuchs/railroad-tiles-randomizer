import { createApp } from 'vue'
import App from './App.vue'
import '@fontsource/limelight'
import '@fontsource/josefin-sans/700.css'
import './style.css'
import './styles-shared.css'

createApp(App).mount('#app')

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
