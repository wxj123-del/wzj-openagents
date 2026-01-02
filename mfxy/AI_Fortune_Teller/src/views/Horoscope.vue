<template>
  <div class="grid md:grid-cols-3 gap-6">
    <!-- 左侧：星座选择 -->
    <div class="md:col-span-1 space-y-6">
      <div class="mystic-card">
        <h2 class="text-xl font-bold text-mystic-gold mb-4">⭐ 星座运势</h2>

        <!-- 星座选择 -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm mb-2">选择您的星座</label>
          <select
            v-model="selectedZodiac"
            class="mystic-input"
          >
            <option value="">请选择星座</option>
            <option v-for="sign in ZODIAC_SIGNS" :key="sign.name" :value="sign.name">
              {{ sign.name }} ({{ sign.date }})
            </option>
          </select>
        </div>

        <!-- 时间范围 -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm mb-2">时间范围</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="period = '今日'"
              :class="period === '今日' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
            >
              今日
            </button>
            <button
              @click="period = '本周'"
              :class="period === '本周' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
            >
              本周
            </button>
            <button
              @click="period = '本月'"
              :class="period === '本月' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
            >
              本月
            </button>
          </div>
        </div>

        <!-- 查询按钮 -->
        <button
          @click="handleQuery"
          :disabled="!selectedZodiac || isLoading"
          class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">查询中...</span>
          <span v-else>查询运势</span>
        </button>
      </div>

      <!-- 星座信息卡片 -->
      <div v-if="selectedZodiac" class="mystic-card">
        <div class="text-center">
          <div class="text-6xl mb-3">{{ getZodiacEmoji(selectedZodiac) }}</div>
          <h3 class="text-2xl font-bold text-mystic-gold mb-2">{{ selectedZodiac }}</h3>
          <p class="text-gray-400 text-sm">{{ getZodiacDate(selectedZodiac) }}</p>
          <p class="text-gray-300 mt-2">属性：{{ getZodiacElement(selectedZodiac) }}</p>
        </div>
      </div>
    </div>

    <!-- 中间：数字人 -->
    <div class="md:col-span-1 space-y-6">
      <AvatarContainer />

      <!-- 对话记录 -->
      <div class="mystic-card max-h-[300px] overflow-y-auto">
        <h3 class="text-lg font-bold text-mystic-gold mb-3">💬 星座解读</h3>
        <div class="space-y-3">
          <div v-if="horoscopeResult" class="p-3 bg-mystic-purple/20 rounded-lg">
            <div class="text-gray-300 whitespace-pre-wrap">{{ horoscopeResult }}</div>
          </div>
          <div v-else class="text-center text-gray-400 py-8">
            {{ isLoading ? '数字人正在解读...' : '选择星座开始查询...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：完整运势 -->
    <div class="md:col-span-1">
      <div class="mystic-card sticky top-6">
        <h3 class="text-lg font-bold text-mystic-gold mb-3">🌟 运势详情</h3>
        <div v-if="horoscopeResult" class="text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
          {{ horoscopeResult }}
        </div>
        <div v-else class="text-center text-gray-400 py-8">
          运势详情将在这里显示
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { useFortuneStore } from '@/stores/fortune'
import AvatarContainer from '@/components/Avatar/AvatarContainer.vue'
import { generateHoroscopePrompt, callModelStream } from '@/services/modelAPI'
import { ZODIAC_SIGNS } from '@/utils/constants'

const avatarStore = useAvatarStore()
const fortuneStore = useFortuneStore()

const selectedZodiac = ref('')
const period = ref('今日')
const horoscopeResult = ref('')
const isLoading = ref(false)

function getZodiacEmoji(name: string): string {
  const emojis: Record<string, string> = {
    '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋',
    '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏',
    '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓'
  }
  return emojis[name] || '⭐'
}

function getZodiacDate(name: string): string {
  const sign = ZODIAC_SIGNS.find(s => s.name === name)
  return sign?.date || ''
}

function getZodiacElement(name: string): string {
  const sign = ZODIAC_SIGNS.find(s => s.name === name)
  return sign?.element || ''
}

async function handleQuery() {
  if (!selectedZodiac.value || isLoading.value) return

  isLoading.value = true
  horoscopeResult.value = ''

  // 如果数字人已连接，切换到倾听状态
  if (avatarStore.isConnected) {
    avatarStore.setState('listen')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // 生成运势
  const prompt = generateHoroscopePrompt(selectedZodiac.value, period.value)

  // 切换到思考状态
  if (avatarStore.isConnected) {
    avatarStore.setState('think')
  }

  // 调用AI模型
  let fullResponse = ''

  try {
    if (!avatarStore.keys?.modelscope_api_key) {
      throw new Error('请先配置魔搭API密钥')
    }

    await callModelStream(
      [{ role: 'user', content: prompt }],
      (chunk) => {
        fullResponse += chunk
        horoscopeResult.value = fullResponse
      },
      () => {
        // 完成后保存记录
        fortuneStore.addFortuneRecord({
          id: Date.now().toString(),
          type: 'horoscope',
          question: `${selectedZodiac.value}${period.value}运势`,
          result: fullResponse,
          timestamp: Date.now(),
          zodiac: selectedZodiac.value
        })

        // 数字人说话
        if (avatarStore.isConnected && fullResponse) {
          avatarStore.setState('speak')
          avatarStore.speak(fullResponse, true, true)
        }

        isLoading.value = false
      },
      (error) => {
        console.error('运势查询失败:', error)
        horoscopeResult.value = '查询失败：' + error
        isLoading.value = false
      },
      avatarStore.keys.modelscope_api_key
    )
  } catch (error: any) {
    console.error('调用AI失败:', error)
    horoscopeResult.value = '调用AI失败：' + error.message
    isLoading.value = false
  }
}
</script>
