import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StoredKeys } from '@/types'
import { loadKeys, saveKeys, clearKeys, getTestKeys } from '@/utils/storage'

export const useConfigStore = defineStore('config', () => {
  const keys = ref<StoredKeys | null>(null)
  const isConfigured = ref(false)

  /**
   * 加载密钥配置
   */
  function loadConfig() {
    const savedKeys = loadKeys()
    if (savedKeys) {
      keys.value = savedKeys
      isConfigured.value = true
    }
  }

  /**
   * 保存密钥配置
   */
  function saveConfig(newKeys: StoredKeys) {
    keys.value = newKeys
    saveKeys(newKeys)
    isConfigured.value = true
  }

  /**
   * 使用测试密钥
   */
  function useTestKeys() {
    const testKeys = getTestKeys()
    saveConfig(testKeys)
    return testKeys
  }

  /**
   * 清除配置
   */
  function clearConfig() {
    keys.value = null
    isConfigured.value = false
    clearKeys()
  }

  return {
    keys,
    isConfigured,
    loadConfig,
    saveConfig,
    useTestKeys,
    clearConfig
  }
})
