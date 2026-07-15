import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import './shared/styles/common.css'

createApp(App).use(router).mount('#app')