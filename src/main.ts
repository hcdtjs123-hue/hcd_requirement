import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/app/router/index'

import './styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Initialize auth after app is mounted
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
authStore.initAuth()
