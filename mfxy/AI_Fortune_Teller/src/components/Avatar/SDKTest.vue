<template>
  <div class="mystic-card p-6">
    <h2 class="text-xl font-bold text-mystic-gold mb-4">SDK调试工具</h2>

    <div class="space-y-4">
      <!-- 检查结果 -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-gray-300">SDK已加载:</span>
          <span :class="sdkLoaded ? 'text-green-400' : 'text-red-400'">
            {{ sdkLoaded ? '✓' : '✗' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-300">容器存在:</span>
          <span :class="containerExists ? 'text-green-400' : 'text-red-400'">
            {{ containerExists ? '✓' : '✗' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-300">容器尺寸:</span>
          <span class="text-mystic-gold">{{ containerSize }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-300">SDK实例:</span>
          <span :class="hasInstance ? 'text-green-400' : 'text-red-400'">
            {{ hasInstance ? '✓' : '✗' }}
          </span>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="space-y-2">
        <button
          @click="checkSDK"
          class="w-full px-4 py-2 bg-mystic-purple hover:bg-mystic-purple/70 text-white rounded-lg"
        >
          检查SDK状态
        </button>

        <button
          @click="testCreateInstance"
          :disabled="!sdkLoaded || !containerExists"
          class="w-full px-4 py-2 bg-mystic-gold hover:bg-yellow-500 text-purple-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          创建测试实例
        </button>
      </div>

      <!-- 日志输出 -->
      <div v-if="logs.length > 0" class="mt-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-2">调试日志:</h3>
        <div class="bg-black/50 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="text-xs font-mono mb-1" :class="log.color">
            {{ log.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatar'

const avatarStore = useAvatarStore()

const sdkLoaded = ref(false)
const containerExists = ref(false)
const containerSize = ref('')
const hasInstance = ref(false)
const logs = ref<Array<{ text: string; color: string }>>([])

function addLog(text: string, color: string = 'text-gray-300') {
  logs.value.push({ text: `[${new Date().toLocaleTimeString()}] ${text}`, color })
  console.log(text)
}

function checkSDK() {
  logs.value = []

  // 检查SDK
  sdkLoaded.value = !!(window as any).XmovAvatar
  addLog(`SDK已加载: ${sdkLoaded.value}`, sdkLoaded.value ? 'text-green-400' : 'text-red-400')

  if (sdkLoaded.value) {
    const XmovAvatar = (window as any).XmovAvatar
    addLog(`XmovAvatar类型: ${typeof XmovAvatar}`, 'text-gray-400')
    addLog(`XmovAvatar.prototype: ${typeof XmovAvatar.prototype}`, 'text-gray-400')
  }

  // 检查容器
  const container = document.getElementById('avatar-container')
  containerExists.value = !!container
  addLog(`容器存在: ${containerExists.value}`, containerExists.value ? 'text-green-400' : 'text-red-400')

  if (container) {
    const rect = container.getBoundingClientRect()
    containerSize.value = `${Math.round(rect.width)}x${Math.round(rect.height)}`
    addLog(`容器尺寸: ${containerSize.value}`, 'text-mystic-gold')
    addLog(`容器offsetWidth: ${container.offsetWidth}`, 'text-gray-400')
    addLog(`容器offsetHeight: ${container.offsetHeight}`, 'text-gray-400')
    addLog(`容器style.height: ${container.style.height}`, 'text-gray-400')
  }

  // 检查实例
  hasInstance.value = !!avatarStore.isConnected
  addLog(`SDK已连接: ${hasInstance.value}`, hasInstance.value ? 'text-green-400' : 'text-red-400')
}

function testCreateInstance() {
  addLog('尝试创建SDK实例...', 'text-yellow-400')

  if (!avatarStore.keys) {
    addLog('错误: 未配置密钥', 'text-red-400')
    return
  }

  // 等待下一帧确保DOM完全渲染
  requestAnimationFrame(() => {
    // 再次检查容器
    const container = document.getElementById('avatar-container')
    if (!container) {
      addLog('错误: 容器仍然不存在', 'text-red-400')
      return
    }

    addLog(`容器确认存在，offsetWidth: ${container.offsetWidth}, offsetHeight: ${container.offsetHeight}`, 'text-green-400')

    try {
      const XmovAvatar = (window as any).XmovAvatar
      addLog('开始new XmovAvatar...', 'text-yellow-400')

      const instance = new XmovAvatar({
        containerId: '#avatar-container',  // 添加#号前缀
        appId: avatarStore.keys.xingyun_appId,
        appSecret: avatarStore.keys.xingyun_appSecret,
        gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
        enableLogger: true,
        onMessage(msg: any) {
          addLog(`SDK消息: ${JSON.stringify(msg)}`, 'text-blue-400')
        },
        onStateChange(state: string) {
          addLog(`状态变化: ${state}`, 'text-blue-400')
        },
        onStatusChange(status: any) {
          addLog(`SDK状态: ${JSON.stringify(status)}`, 'text-blue-400')
        }
      })

      addLog(`实例创建成功: ${typeof instance}`, 'text-green-400')
      addLog(`实例有init方法: ${typeof instance.init === 'function'}`, 'text-green-400')

      // 等待一段时间让SDK内部初始化
      setTimeout(() => {
        if (typeof instance.init === 'function') {
          addLog('调用init方法...', 'text-yellow-400')

          instance.init({
            onDownloadProgress: (progress: number) => {
              addLog(`下载进度: ${progress}%`, 'text-blue-400')
            }
          }).then(() => {
            addLog('初始化成功!', 'text-green-400')
          }).catch((err: Error) => {
            addLog(`初始化失败: ${err.message}`, 'text-red-400')
            console.error('初始化详细错误:', err)
          })
        }
      }, 500) // 等待500ms

      // 5秒后销毁测试实例
      setTimeout(() => {
        try {
          instance.destroy()
          addLog('测试实例已销毁', 'text-gray-400')
        } catch (e) {
          addLog('销毁实例失败', 'text-red-400')
        }
      }, 10000)
    } catch (error: any) {
      addLog(`创建实例失败: ${error.message}`, 'text-red-400')
      addLog(`错误堆栈: ${error.stack}`, 'text-red-400')
      console.error('创建实例失败:', error)
    }
  })
}

onMounted(() => {
  checkSDK()
})
</script>
