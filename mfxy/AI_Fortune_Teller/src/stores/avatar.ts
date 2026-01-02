import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadKeys, saveKeys, clearKeys } from '@/utils/storage'
import { TEST_KEYS, AVATAR_STATES } from '@/utils/constants'

export const useAvatarStore = defineStore('avatar', () => {
  // SDK实例
  const sdkInstance = ref<any>(null)

  // 连接状态
  const isConnected = ref(false)
  const currentState = ref<string>(AVATAR_STATES.IDLE)
  const isSpeaking = ref(false)
  const connectionError = ref<string>('')

  // 密钥
  const keys = ref<{
    xingyun_appId: string
    xingyun_appSecret: string
    modelscope_api_key: string
  } | null>(null)

  // 是否使用内置密钥
  const useTestKeys = ref(false)

  // 加载进度
  const loadingProgress = ref(0)

  // 初始化时从localStorage加载密钥
  function initKeys() {
    const savedKeys = loadKeys()
    if (savedKeys) {
      keys.value = savedKeys
    }
  }

  // 使用内置测试密钥
  function useBuiltInKeys() {
    keys.value = { ...TEST_KEYS }
    useTestKeys.value = true
    saveKeys(keys.value)
  }

  // 保存密钥
  function updateKeys(newKeys: {
    xingyun_appId: string
    xingyun_appSecret: string
    modelscope_api_key: string
  }) {
    keys.value = newKeys
    useTestKeys.value = false
    saveKeys(newKeys)
  }

  // 清除密钥
  function resetKeys() {
    keys.value = null
    useTestKeys.value = false
    clearKeys()
  }

  // 创建SDK实例
  function createSDK(containerId: string, callback?: (success: boolean) => void) {
    if (!keys.value) {
      connectionError.value = '请先配置API密钥'
      callback?.(false)
      return false
    }

    // 使用requestAnimationFrame确保DOM完全渲染
    requestAnimationFrame(() => {
      try {
        // 检查容器是否存在
        const container = document.getElementById(containerId)
        if (!container) {
          connectionError.value = `容器 ${containerId} 不存在`
          console.error('容器不存在:', containerId)
          callback?.(false)
          return false
        }

        console.log('容器尺寸:', container.offsetWidth, 'x', container.offsetHeight)

        // 动态加载SDK
        if (!(window as any).XmovAvatar) {
          connectionError.value = 'SDK未加载，请刷新页面重试'
          callback?.(false)
          return false
        }

        const XmovAvatar = (window as any).XmovAvatar

        console.log('开始创建SDK实例，容器ID:', containerId)
        console.log('App ID:', keys.value.xingyun_appId)

        sdkInstance.value = new XmovAvatar({
          containerId: '#' + containerId,  // 添加#号前缀
          appId: keys.value.xingyun_appId,
          appSecret: keys.value.xingyun_appSecret,
          gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

          // 消息回调
          onMessage(message: any) {
            console.log('SDK消息:', message)
            if (message.code === 10001) {
              console.error('SDK错误: 容器不存在')
              connectionError.value = 'SDK找不到容器，请刷新页面重试'
            }
          },

          // 状态变化
          onStateChange(state: string) {
            console.log('状态变化:', state)
            currentState.value = state
          },

          // 语音状态变化
          onVoiceStateChange(status: string) {
            console.log('语音状态:', status)
            isSpeaking.value = status === 'start'
          },

          // 网络信息
          onNetworkInfo(networkInfo: any) {
            console.log('网络信息:', networkInfo)
          },

          // Widget事件
          onWidgetEvent(data: any) {
            console.log('Widget事件:', data)
          },

          // 状态渲染变化
          onStateRenderChange(state: string, duration: number) {
            console.log('状态渲染变化:', state, '耗时:', duration)
          },

          // SDK状态变化
          onStatusChange(status: any) {
            console.log('SDK状态变化:', status)
          },

          // 不显示日志
          enableLogger: true // 开启日志以便调试
        })

        console.log('SDK实例创建成功:', sdkInstance.value)
        callback?.(true)
        return true
      } catch (error) {
        console.error('创建SDK实例失败:', error)
        connectionError.value = '创建SDK实例失败: ' + (error as any).message
        callback?.(false)
        return false
      }
    })

    return true // 立即返回true，实际结果通过回调
  }

  // 初始化SDK
  async function initSDK() {
    if (!sdkInstance.value) {
      connectionError.value = 'SDK实例不存在'
      return false
    }

    try {
      console.log('开始调用init方法...')
      console.log('SDK实例:', sdkInstance.value)
      console.log('SDK实例类型:', typeof sdkInstance.value)
      console.log('SDK.init方法:', typeof sdkInstance.value.init)

      // 检查init方法是否存在
      if (typeof sdkInstance.value.init !== 'function') {
        throw new Error('SDK实例没有init方法')
      }

      await sdkInstance.value.init({
        onDownloadProgress: (progress: number) => {
          console.log('下载进度:', progress)
          loadingProgress.value = progress
        }
      })

      isConnected.value = true
      connectionError.value = ''
      console.log('SDK初始化成功')
      return true
    } catch (error) {
      console.error('初始化SDK失败:', error)
      console.error('错误堆栈:', (error as any).stack)

      // 提供更详细的错误信息
      let errorMsg = '初始化失败'
      if ((error as any).message) {
        errorMsg += ': ' + (error as any).message
      }

      connectionError.value = errorMsg
      isConnected.value = false
      return false
    }
  }

  // 断开连接 - 完全清理
  function disconnect() {
    console.log('开始断开SDK连接...')

    if (sdkInstance.value) {
      try {
        // 调用destroy方法
        if (typeof sdkInstance.value.destroy === 'function') {
          sdkInstance.value.destroy()
          console.log('SDK destroy方法已调用')
        }

        // 清理容器内的所有元素
        const container = document.getElementById('avatar-container')
        if (container) {
          console.log('清理容器,当前子元素数:', container.children.length)
          while (container.firstChild) {
            container.removeChild(container.firstChild)
          }
          console.log('容器已清空')
        }

        sdkInstance.value = null
        console.log('SDK实例已置空')
      } catch (error) {
        console.error('销毁SDK失败:', error)
      }
    }

    // 重置所有状态
    isConnected.value = false
    currentState.value = AVATAR_STATES.IDLE
    loadingProgress.value = 0
    connectionError.value = ''

    console.log('SDK断开完成')
  }

  // 状态控制方法
  function setState(state: string) {
    if (!sdkInstance.value || !isConnected.value) {
      console.warn('SDK未连接')
      return
    }

    try {
      switch (state) {
        case AVATAR_STATES.IDLE:
          sdkInstance.value.idle()
          break
        case AVATAR_STATES.LISTEN:
          sdkInstance.value.listen()
          break
        case AVATAR_STATES.THINK:
          sdkInstance.value.think()
          break
        case AVATAR_STATES.INTERACTIVE_IDLE:
          sdkInstance.value.interactiveidle()
          break
        case AVATAR_STATES.ONLINE:
          sdkInstance.value.onlineMode()
          break
        case AVATAR_STATES.OFFLINE:
          sdkInstance.value.offlineMode()
          break
        default:
          console.warn('未知状态:', state)
      }
      currentState.value = state
    } catch (error) {
      console.error('设置状态失败:', error)
    }
  }

  // 说话
  function speak(text: string, isStart: boolean = true, isEnd: boolean = true) {
    if (!sdkInstance.value || !isConnected.value) {
      console.warn('SDK未连接')
      return
    }

    try {
      sdkInstance.value.speak(text, isStart, isEnd)
    } catch (error) {
      console.error('说话失败:', error)
    }
  }

  // 计算属性
  const canConnect = computed(() => {
    return keys.value !== null
  })

  const statusText = computed(() => {
    if (connectionError.value) return connectionError.value
    if (!isConnected.value) return '未连接'
    return `已连接 - ${currentState.value}`
  })

  // 初始化
  initKeys()

  return {
    // 状态
    isConnected,
    currentState,
    isSpeaking,
    connectionError,
    keys,
    useTestKeys,
    loadingProgress,
    canConnect,
    statusText,

    // 方法
    initKeys,
    useBuiltInKeys,
    updateKeys,
    resetKeys,
    createSDK,
    initSDK,
    disconnect,
    setState,
    speak
  }
})
