import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'
import './styles/animations.css'
import './styles/utilities.css'

createApp(App).mount('#app')

const registerServiceWorker = async () => {
  const isHttpProtocol =
    window.location.protocol === 'http:' || window.location.protocol === 'https:'
  const isSecureWeb =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  if (!('serviceWorker' in navigator) || !isHttpProtocol || !isSecureWeb) return

  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.warn('Service worker registration failed:', error)
  }
}

void registerServiceWorker()
