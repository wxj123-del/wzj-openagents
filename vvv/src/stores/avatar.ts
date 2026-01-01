import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AvatarState, AvatarStatus } from '@/types'

// 声明全局 SDK 类型
declare global {
  interface Window {
    XmovAvatar: any
  }
}

export const useAvatarStore = defineStore('avatar', () => {
  const isConnected = ref(false)
  const currentStatus = ref<AvatarStatus>('offline')
  const currentState = ref<AvatarState>('idle')
  const isVoicePlaying = ref(false)
  const sdkInstance = ref<any>(null)
  const errorMessage = ref('')

  /**
   * 等待SDK加载完成
   */
  async function waitForSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.XmovAvatar) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('SDK加载超时'))
      }, 10000)

      const checkInterval = setInterval(() => {
        if (window.XmovAvatar) {
          clearTimeout(timeout)
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * 初始化数字人SDK
   */
  async function init(containerId: string, appId: string, appSecret: string) {
    try {
      // 确保containerId包含#前缀
      const containerIdWithHash = containerId.startsWith('#') ? containerId : `#${containerId}`

      // 检查容器是否存在
      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error(`找不到容器元素: ${containerId}`)
      }

      // 确保容器有尺寸
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        console.warn('容器尺寸为0,设置默认尺寸')
        container.style.width = '400px'
        container.style.height = '600px'
      }

      console.log('开始初始化数字人SDK...')
      console.log('容器ID:', containerIdWithHash)
      console.log('容器尺寸:', container.offsetWidth, 'x', container.offsetHeight)
      console.log('AppID:', appId)

      // 等待SDK加载
      await waitForSDK()
      console.log('SDK已加载')

      // 创建SDK实例
      const config = {
        containerId: containerIdWithHash,
        appId,
        appSecret,
        gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

        // 消息回调
        onMessage: (message: any) => {
          console.log('SDK message:', message)
        },

        // 状态变化回调
        onStateChange: (state: string) => {
          console.log('State changed:', state)
          currentState.value = state as AvatarState
        },

        // 语音状态变化回调
        onVoiceStateChange: (status: string) => {
          console.log('Voice status:', status)
          isVoicePlaying.value = status === 'voice_start'
        },

        // 网络状态回调
        onStatusChange: (status: any) => {
          console.log('Status change:', status)
          if (typeof status === 'number') {
            currentStatus.value = status === 0 ? 'online' : status === 1 ? 'offline' : 'close'
          }
        },

        enableLogger: true
      }

      console.log('创建SDK实例...')
      console.log('配置参数:', {
        containerId: config.containerId,
        appId: config.appId,
        gatewayServer: config.gatewayServer
      })

      sdkInstance.value = new window.XmovAvatar(config)
      console.log('SDK实例已创建,类型:', typeof sdkInstance.value)
      console.log('SDK实例方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(sdkInstance.value)))

      // 等待一小段时间确保SDK实例完全创建
      await new Promise(resolve => setTimeout(resolve, 100))

      // 初始化SDK
      console.log('开始调用init方法...')

      // 检查init方法是否存在
      if (typeof sdkInstance.value.init !== 'function') {
        throw new Error('SDK实例没有init方法')
      }

      await sdkInstance.value.init({
        onDownloadProgress: (progress: number) => {
          console.log(`SDK加载进度: ${progress}%`)
        }
      })

      console.log('SDK初始化完成')

      isConnected.value = true
      errorMessage.value = ''
      return true
    } catch (error: any) {
      console.error('初始化数字人失败:', error)
      console.error('错误堆栈:', error.stack)
      errorMessage.value = error.message || '初始化失败'
      isConnected.value = false
      return false
    }
  }

  /**
   * 销毁数字人实例
   */
  function destroy() {
    if (sdkInstance.value) {
      try {
        sdkInstance.value.destroy()
      } catch (error) {
        console.error('销毁SDK实例失败:', error)
      }
      sdkInstance.value = null
    }
    isConnected.value = false
    currentState.value = 'idle'
    currentStatus.value = 'offline'
  }

  /**
   * 让数字人说话
   */
  function speak(text: string, isStart: boolean, isEnd: boolean) {
    if (sdkInstance.value) {
      sdkInstance.value.speak(text, isStart, isEnd)
    }
  }

  /**
   * 切换状态
   */
  function setState(state: AvatarState) {
    if (!sdkInstance.value) return

    currentState.value = state

    switch (state) {
      case 'idle':
        sdkInstance.value.idle?.()
        break
      case 'interactive_idle':
        sdkInstance.value.interactiveidle?.()
        break
      case 'listen':
        sdkInstance.value.listen?.()
        break
      case 'think':
        sdkInstance.value.think?.()
        break
      case 'offline':
        sdkInstance.value.offlineMode?.()
        break
      case 'online':
        sdkInstance.value.onlineMode?.()
        break
    }
  }

  /**
   * 设置音量
   */
  function setVolume(volume: number) {
    if (sdkInstance.value) {
      sdkInstance.value.setVolume?.(volume)
    }
  }

  return {
    isConnected,
    currentStatus,
    currentState,
    isVoicePlaying,
    errorMessage,
    sdkInstance,
    init,
    destroy,
    speak,
    setState,
    setVolume
  }
})
