import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

// 导入自己的ui组件库
import UI from '@/components/library/index'

import 'normalize.css'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(UI)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
