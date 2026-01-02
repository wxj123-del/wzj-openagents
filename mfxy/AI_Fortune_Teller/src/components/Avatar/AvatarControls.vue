<template>
  <div class="mystic-card space-y-4">
    <h3 class="text-xl font-bold text-mystic-gold mb-4">数字人控制</h3>

    <!-- 连接控制 -->
    <div v-if="!avatarStore.isConnected" class="space-y-3">
      <button
        @click="handleConnect"
        :disabled="!avatarStore.canConnect || isLoading"
        class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">连接中...</span>
        <span v-else>连接数字人</span>
      </button>

      <div v-if="!avatarStore.keys" class="text-center text-yellow-400 text-sm">
        请先在设置中配置API密钥
      </div>
    </div>

    <!-- 断开连接 -->
    <div v-else class="space-y-3">
      <button
        @click="handleDisconnect"
        class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
      >
        断开连接
      </button>
    </div>

    <!-- 状态控制（仅在连接时可用） -->
    <div v-if="avatarStore.isConnected" class="border-t border-mystic-purple/30 pt-4">
      <h4 class="text-sm font-semibold text-gray-300 mb-3">状态切换</h4>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="avatarStore.setState('idle')"
          class="px-4 py-2 bg-mystic-purple/50 hover:bg-mystic-purple/70 text-white rounded-lg transition-all text-sm"
        >
          待机
        </button>
        <button
          @click="avatarStore.setState('listen')"
          class="px-4 py-2 bg-mystic-purple/50 hover:bg-mystic-purple/70 text-white rounded-lg transition-all text-sm"
        >
          倾听
        </button>
        <button
          @click="avatarStore.setState('think')"
          class="px-4 py-2 bg-mystic-purple/50 hover:bg-mystic-purple/70 text-white rounded-lg transition-all text-sm"
        >
          思考
        </button>
        <button
          @click="avatarStore.setState('interactive_idle')"
          class="px-4 py-2 bg-mystic-purple/50 hover:bg-mystic-purple/70 text-white rounded-lg transition-all text-sm"
        >
          互动待机
        </button>
      </div>
    </div>

    <!-- 测试说话 -->
    <div v-if="avatarStore.isConnected" class="border-t border-mystic-purple/30 pt-4">
      <h4 class="text-sm font-semibold text-gray-300 mb-3">测试说话</h4>
      <button
        @click="handleTestSpeak"
        class="w-full px-4 py-2 bg-mystic-gold hover:bg-yellow-500 text-purple-900 rounded-lg font-semibold transition-all"
      >
        测试语音
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="avatarStore.connectionError" class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
      <p class="text-red-300 text-sm">{{ avatarStore.connectionError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { loadAvatarSDK } from '@/services/avatarAPI'

const avatarStore = useAvatarStore()
const isLoading = ref(false)

async function handleConnect() {
  if (!avatarStore.canConnect || isLoading.value) return

  isLoading.value = true
  avatarStore.connectionError = ''

  try {
    // 加载SDK脚本
    console.log('开始加载SDK脚本...')
    await loadAvatarSDK()
    console.log('SDK脚本加载完成')

    // 等待确保SDK完全加载
    await new Promise(resolve => setTimeout(resolve, 500))

    // 创建SDK实例（使用回调）
    console.log('创建SDK实例...')
    avatarStore.createSDK('avatar-container', (success) => {
      if (!success) {
        isLoading.value = false
        return
      }

      // 等待一段时间让SDK内部初始化完成
      setTimeout(async () => {
        console.log('初始化SDK...')
        const initSuccess = await avatarStore.initSDK()
        if (!initSuccess) {
          isLoading.value = false
          return
        }

        console.log('SDK初始化成功')

        // 切换到待机状态
        setTimeout(() => {
          avatarStore.setState('idle')
          isLoading.value = false
        }, 500)
      }, 500)
    })
  } catch (error: any) {
    console.error('连接失败:', error)
    avatarStore.connectionError = error.message || '连接失败'
    isLoading.value = false
  }
}

function handleDisconnect() {
  avatarStore.disconnect()
}

function handleTestSpeak() {
  avatarStore.speak('欢迎来到AI占卜师，我是您的专属占卜师，很高兴为您服务！', true, true)
}
</script>
