/**
 * 星云数字人SDK类型定义
 */
export interface AvatarConfig {
  containerId: string
  appId: string
  appSecret: string
  gatewayServer: string
  onWidgetEvent?: (data: any) => void
  proxyWidget?: Record<string, (data: any) => void>
  onNetworkInfo?: (info: NetworkInfo) => void
  onMessage?: (message: SDKMessage) => void
  onStateChange?: (state: string) => void
  onStatusChange?: (status: SDKStatus) => void
  onStateRenderChange?: (state: string, duration: number) => void
  onVoiceStateChange?: (status: string) => void
  enableLogger?: boolean
}

export interface NetworkInfo {
  rtt: number // 延迟，毫秒
  downlink: number // 下载速率（MB/s）
}

export interface SDKMessage {
  code: number
  message: string
  timestamp: number
  originalError?: string
}

export enum SDKStatus {
  online = 0,
  offline = 1,
  network_on = 2,
  network_off = 3,
  close = 4
}

/**
 * SDK管理类
 */
export class AvatarSDKManager {
  private sdkInstance: any = null
  private containerId: string

  constructor(containerId: string) {
    this.containerId = containerId
  }

  /**
   * 创建SDK实例
   */
  createInstance(config: AvatarConfig): boolean {
    try {
      const XmovAvatar = (window as any).XmovAvatar
      if (!XmovAvatar) {
        console.error('XmovAvatar SDK未加载')
        return false
      }

      this.sdkInstance = new XmovAvatar({
        containerId: this.containerId,
        ...config
      })

      return true
    } catch (error) {
      console.error('创建SDK实例失败:', error)
      return false
    }
  }

  /**
   * 初始化SDK
   */
  async init(onDownloadProgress?: (progress: number) => void): Promise<boolean> {
    if (!this.sdkInstance) {
      console.error('SDK实例不存在')
      return false
    }

    try {
      await this.sdkInstance.init({
        onDownloadProgress
      })
      return true
    } catch (error) {
      console.error('初始化SDK失败:', error)
      return false
    }
  }

  /**
   * 设置状态
   */
  setState(state: string): void {
    if (!this.sdkInstance) return

    const stateMethods: Record<string, () => void> = {
      idle: () => this.sdkInstance.idle(),
      listen: () => this.sdkInstance.listen(),
      think: () => this.sdkInstance.think(),
      interactive_idle: () => this.sdkInstance.interactiveidle(),
      onlineMode: () => this.sdkInstance.onlineMode(),
      offlineMode: () => this.sdkInstance.offlineMode()
    }

    const method = stateMethods[state]
    if (method) {
      method()
    }
  }

  /**
   * 说话
   */
  speak(text: string, isStart: boolean = true, isEnd: boolean = true): void {
    if (!this.sdkInstance) return

    try {
      this.sdkInstance.speak(text, isStart, isEnd)
    } catch (error) {
      console.error('说话失败:', error)
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (!this.sdkInstance) return
    this.sdkInstance.setVolume(volume)
  }

  /**
   * 显示调试信息
   */
  showDebugInfo(): void {
    if (!this.sdkInstance) return
    this.sdkInstance.showDebugInfo()
  }

  /**
   * 隐藏调试信息
   */
  hideDebugInfo(): void {
    if (!this.sdkInstance) return
    this.sdkInstance.hideDebugInfo()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.sdkInstance) {
      try {
        this.sdkInstance.destroy()
      } catch (error) {
        console.error('销毁SDK失败:', error)
      }
      this.sdkInstance = null
    }
  }

  /**
   * 获取实例
   */
  getInstance(): any {
    return this.sdkInstance
  }
}

/**
 * 动态加载SDK脚本
 */
export function loadAvatarSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if ((window as any).XmovAvatar) {
      console.log('✓ SDK已加载')
      resolve()
      return
    }

    console.log('⏳ 等待SDK加载...')
    let attempts = 0
    const maxAttempts = 300 // 300次 * 100ms = 30秒

    const checkInterval = setInterval(() => {
      attempts++

      if ((window as any).XmovAvatar) {
        console.log(`✓ SDK加载完成 (耗时: ${attempts * 100}ms)`)
        clearInterval(checkInterval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.error('❌ SDK加载超时')

        // 提供详细的错误信息
        const scripts = Array.from(document.querySelectorAll('script'))
        const sdkScript = scripts.find(s => s.src.includes('xmovAvatar'))

        if (sdkScript) {
          console.error('SDK脚本标签:', sdkScript)
          console.error('SDK脚本URL:', sdkScript.src)
          console.error('SDK脚本加载状态:', sdkScript.readyState)
        } else {
          console.error('❌ 找不到SDK脚本标签！')
        }

        reject(new Error('SDK加载超时，请检查网络连接或刷新页面重试'))
      } else if (attempts % 50 === 0) {
        // 每5秒打印一次进度
        console.log(`⏳ SDK加载中... (${attempts * 100}ms)`)
      }
    }, 100)
  })
}
