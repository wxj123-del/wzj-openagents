import type { StoredKeys } from '@/types'

const KEY_STORAGE_KEY = 'gov_hall_keys'

/**
 * 加载存储的密钥
 */
export function loadKeys(): StoredKeys | null {
  try {
    const stored = localStorage.getItem(KEY_STORAGE_KEY)
    if (stored) {
      // 简单的base64解码
      const decoded = atob(stored)
      return JSON.parse(decoded)
    }
  } catch (e) {
    console.error('Failed to load keys:', e)
  }
  return null
}

/**
 * 保存密钥
 */
export function saveKeys(keys: StoredKeys): void {
  try {
    const encoded = btoa(JSON.stringify(keys))
    localStorage.setItem(KEY_STORAGE_KEY, encoded)
  } catch (e) {
    console.error('Failed to save keys:', e)
  }
}

/**
 * 清除密钥
 */
export function clearKeys(): void {
  localStorage.removeItem(KEY_STORAGE_KEY)
}

/**
 * 获取测试密钥
 */
export function getTestKeys(): StoredKeys {
  return {
    xingyunAppId: import.meta.env.VITE_TEST_XINGYUN_APP_ID || '',
    xingyunAppSecret: import.meta.env.VITE_TEST_XINGYUN_APP_SECRET || '',
    modelScopeApiKey: import.meta.env.VITE_TEST_MODELSCOPE_API_KEY || '65254e14e816423da6218e47b2003ea8',
    isTestKey: true
  }
}
