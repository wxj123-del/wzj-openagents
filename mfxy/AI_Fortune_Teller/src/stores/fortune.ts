import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addHistory, loadHistory } from '@/utils/storage'

export interface FortuneRecord {
  id: string
  type: 'tarot' | 'horoscope' | 'psychology'
  question: string
  result: string
  timestamp: number
  zodiac?: string
  cards?: string[]
}

export const useFortuneStore = defineStore('fortune', () => {
  const history = ref<FortuneRecord[]>([])
  const isLoading = ref(false)
  const currentReading = ref<FortuneRecord | null>(null)

  // 加载历史记录
  function loadHistoryData() {
    history.value = loadHistory()
  }

  // 添加占卜记录
  function addFortuneRecord(record: FortuneRecord) {
    currentReading.value = record
    addHistory(record)
    loadHistoryData()
  }

  // 清空历史
  function clearHistory() {
    history.value = []
    localStorage.removeItem('fortune_history')
  }

  // 初始化
  loadHistoryData()

  return {
    history,
    isLoading,
    currentReading,
    loadHistoryData,
    addFortuneRecord,
    clearHistory
  }
})
