<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="mystic-title text-3xl">📜 占卜历史</h1>
      <button
        v-if="fortuneStore.history.length > 0"
        @click="handleClearHistory"
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all"
      >
        清空历史
      </button>
    </div>

    <!-- 历史记录列表 -->
    <div v-if="fortuneStore.history.length > 0" class="space-y-4">
      <div
        v-for="record in fortuneStore.history"
        :key="record.id"
        class="mystic-card hover:scale-[1.02] transition-transform duration-300"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">{{ typeIcon(record.type) }}</span>
            <span class="text-mystic-gold font-semibold">{{ typeName(record.type) }}</span>
          </div>
          <span class="text-gray-400 text-sm">{{ formatDate(record.timestamp) }}</span>
        </div>

        <div class="mb-3">
          <div class="text-gray-300 font-semibold mb-1">问题：</div>
          <div class="text-gray-200">{{ record.question }}</div>
        </div>

        <div>
          <div class="text-gray-300 font-semibold mb-1">解读：</div>
          <div class="text-gray-200 whitespace-pre-wrap">{{ record.result }}</div>
        </div>

        <!-- 额外信息 -->
        <div v-if="record.cards && record.cards.length > 0" class="mt-3 flex items-center space-x-2">
          <span class="text-gray-400 text-sm">抽牌：</span>
          <span v-for="card in record.cards" :key="card" class="px-2 py-1 bg-mystic-purple/30 rounded text-sm text-mystic-gold">
            {{ card }}
          </span>
        </div>

        <div v-if="record.zodiac" class="mt-3 flex items-center space-x-2">
          <span class="text-gray-400 text-sm">星座：</span>
          <span class="px-2 py-1 bg-mystic-purple/30 rounded text-sm text-mystic-gold">{{ record.zodiac }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="mystic-card text-center py-12">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-gray-300 text-lg">暂无占卜记录</p>
      <p class="text-gray-400 text-sm mt-2">开始您的第一次占卜吧</p>
      <router-link to="/tarot" class="inline-block mt-4 mystic-btn">
        开始占卜
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFortuneStore } from '@/stores/fortune'
import dayjs from 'dayjs'

const fortuneStore = useFortuneStore()

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    tarot: '🃏',
    horoscope: '⭐',
    psychology: '🧠'
  }
  return icons[type] || '🔮'
}

function typeName(type: string): string {
  const names: Record<string, string> = {
    tarot: '塔罗占卜',
    horoscope: '星座运势',
    psychology: '心理测试'
  }
  return names[type] || '占卜'
}

function formatDate(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

function handleClearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    fortuneStore.clearHistory()
  }
}
</script>
