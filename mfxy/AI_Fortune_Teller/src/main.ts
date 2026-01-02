import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// 检查SDK是否加载
console.log('=== 应用启动 ===')
console.log('检查SDK加载状态...')

setTimeout(() => {
  if ((window as any).XmovAvatar) {
    console.log('✓ XmovAvatar SDK已加载')
  } else {
    console.error('❌ XmovAvatar SDK未加载')
    console.log('请检查网络连接或刷新页面')
  }
}, 2000)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
