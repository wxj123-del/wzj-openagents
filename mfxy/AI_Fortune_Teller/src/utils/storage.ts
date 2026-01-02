import CryptoJS from 'crypto-js'

const SECRET_KEY = 'ai-fortune-teller-2025'
const STORAGE_KEY = 'ai_fortune_keys'

/**
 * 加密并保存密钥到localStorage
 */
export function saveKeys(keys: {
  xingyun_appId: string
  xingyun_appSecret: string
  modelscope_api_key: string
}): void {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(keys),
      SECRET_KEY
    ).toString()
    localStorage.setItem(STORAGE_KEY, encrypted)
  } catch (error) {
    console.error('保存密钥失败:', error)
    throw new Error('密钥保存失败')
  }
}

/**
 * 从localStorage读取并解密密钥
 */
export function loadKeys(): {
  xingyun_appId: string
  xingyun_appSecret: string
  modelscope_api_key: string
} | null {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    if (!encrypted) return null

    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedStr) return null

    return JSON.parse(decryptedStr)
  } catch (error) {
    console.error('读取密钥失败:', error)
    return null
  }
}

/**
 * 清除密钥
 */
export function clearKeys(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 保存占卜历史
 */
export function saveHistory(history: any[]): void {
  try {
    localStorage.setItem('fortune_history', JSON.stringify(history))
  } catch (error) {
    console.error('保存历史失败:', error)
  }
}

/**
 * 读取占卜历史
 */
export function loadHistory(): any[] {
  try {
    const history = localStorage.getItem('fortune_history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('读取历史失败:', error)
    return []
  }
}

/**
 * 添加历史记录
 */
export function addHistory(item: any): void {
  const history = loadHistory()
  history.unshift(item)
  // 只保留最近50条
  if (history.length > 50) {
    history.pop()
  }
  saveHistory(history)
}
