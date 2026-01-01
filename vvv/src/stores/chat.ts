import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)

  /**
   * 添加用户消息
   */
  function addUserMessage(content: string) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    messages.value.push(message)
  }

  /**
   * 添加助手消息
   */
  function addAssistantMessage(content: string) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: Date.now()
    }
    messages.value.push(message)
  }

  /**
   * 清空对话历史
   */
  function clearMessages() {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    addUserMessage,
    addAssistantMessage,
    clearMessages
  }
})
