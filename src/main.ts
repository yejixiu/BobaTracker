import { createApp } from 'vue'
import { Lazyload } from 'vant'
import App from './App.vue'
import { router } from './router'
import './styles/global.css'

const app = createApp(App)
app.use(router)
app.use(Lazyload)
app.mount('#app')
