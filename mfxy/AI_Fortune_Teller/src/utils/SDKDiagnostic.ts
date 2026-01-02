/**
 * SDK诊断工具
 */

export function diagnoseSDK() {
  const results: { [key: string]: any } = {}

  // 1. 检查SDK加载
  results.sdkLoaded = typeof (window as any).XmovAvatar !== 'undefined'
  results.sdkType = results.sdkLoaded ? typeof (window as any).XmovAvatar : 'undefined'

  if (results.sdkLoaded) {
    const XmovAvatar = (window as any).XmovAvatar
    results.sdkPrototype = typeof XmovAvatar.prototype
    results.sdkConstructor = XmovAvatar.toString().substring(0, 200)
  }

  // 2. 检查容器
  const container = document.getElementById('avatar-container')
  results.containerExists = !!container

  if (container) {
    results.containerInfo = {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      scrollWidth: container.scrollWidth,
      scrollHeight: container.scrollHeight,
      display: getComputedStyle(container).display,
      position: getComputedStyle(container).position,
      visibility: getComputedStyle(container).visibility,
      opacity: getComputedStyle(container).opacity
    }

    const rect = container.getBoundingClientRect()
    results.containerRect = {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height
    }
  }

  // 3. 检查网络
  results.online = navigator.onLine
  results.userAgent = navigator.userAgent

  // 4. 检查浏览器支持
  results.webGL = (() => {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (e) {
      return false
    }
  })()

  results.webWorker = typeof Worker !== 'undefined'

  // 5. 检查控制台
  results.hasConsole = typeof console !== 'undefined'

  return results
}

export function logDiagnosis() {
  const diagnosis = diagnoseSDK()

  console.group('🔍 SDK诊断信息')
  console.log('SDK加载:', diagnosis.sdkLoaded ? '✓' : '✗')
  console.log('SDK类型:', diagnosis.sdkType)

  if (diagnosis.sdkLoaded) {
    console.log('SDK原型:', diagnosis.sdkPrototype)
  }

  console.log('\n容器信息:')
  console.log('  存在:', diagnosis.containerExists ? '✓' : '✗')

  if (diagnosis.containerInfo) {
    console.log('  尺寸:', diagnosis.containerInfo.offsetWidth, 'x', diagnosis.containerInfo.offsetHeight)
    console.log('  Display:', diagnosis.containerInfo.display)
    console.log('  Position:', diagnosis.containerInfo.position)
    console.log('  Visibility:', diagnosis.containerInfo.visibility)
    console.log('  Opacity:', diagnosis.containerInfo.opacity)
  }

  console.log('\n浏览器信息:')
  console.log('  在线:', diagnosis.online ? '✓' : '✗')
  console.log('  WebGL:', diagnosis.webGL ? '✓' : '✗')
  console.log('  WebWorker:', diagnosis.webWorker ? '✓' : '✗')

  console.groupEnd()

  return diagnosis
}

export async function testSDKWithRetry(
  createFn: () => Promise<any> | any,
  initFn: (instance: any) => Promise<any>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<any> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`尝试 ${i + 1}/${maxRetries}...`)

      // 创建实例
      const instance = await createFn()
      console.log('✓ 实例创建成功')

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // 初始化
      await initFn(instance)
      console.log('✓ 初始化成功')

      return instance
    } catch (error: any) {
      console.error(`✗ 尝试 ${i + 1} 失败:`, error.message)
      lastError = error

      if (i < maxRetries - 1) {
        console.log(`等待 ${retryDelay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError
}
