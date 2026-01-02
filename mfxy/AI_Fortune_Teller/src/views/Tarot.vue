<template>
  <div class="grid md:grid-cols-3 gap-6">
    <!-- 左侧：塔罗牌选择 -->
    <div class="md:col-span-1 space-y-6">
      <div class="mystic-card">
        <h2 class="text-xl font-bold text-mystic-gold mb-4">🃏 塔罗占卜</h2>

        <!-- 问题输入 -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm mb-2">您想问什么？</label>
          <textarea
            v-model="question"
            class="mystic-input min-h-[100px] resize-none"
            placeholder="请输入您想要咨询的问题..."
          ></textarea>
        </div>

        <!-- 牌阵选择 -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm mb-2">选择牌阵</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="spreadType = 'single'"
              :class="spreadType === 'single' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="px-4 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
            >
              单张牌
            </button>
            <button
              @click="spreadType = 'three'"
              :class="spreadType === 'three' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="px-4 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
            >
              三张牌
            </button>
          </div>
        </div>

        <!-- 抽牌按钮 -->
        <button
          @click="handleDrawCards"
          :disabled="!question.trim() || isReading"
          class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isReading">解读中...</span>
          <span v-else>开始抽牌</span>
        </button>
      </div>

      <!-- 抽到的牌 -->
      <div v-if="drawnCards.length > 0" class="mystic-card">
        <h3 class="text-lg font-bold text-mystic-gold mb-3">抽到的牌</h3>
        <div class="space-y-2">
          <div
            v-for="(card, index) in drawnCards"
            :key="index"
            class="flex items-center justify-between p-3 bg-mystic-purple/20 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ card.emoji }}</span>
              <div>
                <div class="text-white font-semibold">{{ card.name }}</div>
                <div class="text-xs text-gray-400">{{ card.position === 'upright' ? '正位' : '逆位' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：数字人 -->
    <div class="md:col-span-1 space-y-6">
      <AvatarContainer />

      <!-- 对话记录 -->
      <div class="mystic-card max-h-[300px] overflow-y-auto">
        <h3 class="text-lg font-bold text-mystic-gold mb-3">💬 对话</h3>
        <div class="space-y-3">
          <div v-if="aiResponse" class="p-3 bg-mystic-purple/20 rounded-lg">
            <div class="text-gray-300 whitespace-pre-wrap">{{ aiResponse }}</div>
          </div>
          <div v-else class="text-center text-gray-400 py-8">
            {{ isReading ? '数字人正在解读...' : '等待抽牌...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：完整解读 -->
    <div class="md:col-span-1">
      <div class="mystic-card sticky top-6">
        <h3 class="text-lg font-bold text-mystic-gold mb-3">📜 完整解读</h3>
        <div v-if="aiResponse" class="text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
          {{ aiResponse }}
        </div>
        <div v-else class="text-center text-gray-400 py-8">
          完整解读将在这里显示
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
import { generateTarotPrompt, callModelStream } from '@/services/modelAPI'

const avatarStore = useAvatarStore()
const fortuneStore = useFortuneStore()

const question = ref('')
const spreadType = ref<'single' | 'three'>('single')
const drawnCards = ref<any[]>([])
const aiResponse = ref('')
const isReading = ref(false)

// 塔罗牌数据（简化版）
const tarotCards = [
  { name: '愚者', emoji: '🃏', meaning: '新的开始、冒险、纯真' },
  { name: '魔术师', emoji: '🎩', meaning: '创造力、技能、意志力' },
  { name: '女祭司', emoji: '🌙', meaning: '直觉、神秘、智慧' },
  { name: '皇后', emoji: '👑', meaning: '丰饶、母性、创造' },
  { name: '皇帝', emoji: '🏛️', meaning: '权威、结构、控制' },
  { name: '教皇', emoji: '⛪', meaning: '传统、信仰、学习' },
  { name: '恋人', emoji: '❤️', meaning: '爱、和谐、选择' },
  { name: '战车', emoji: '🏇', meaning: '胜利、意志、决心' },
  { name: '力量', emoji: '🦁', meaning: '勇气、耐心、控制' },
  { name: '隐士', emoji: '🏮', meaning: '内省、孤独、指引' },
  { name: '命运之轮', emoji: '🎡', meaning: '变化、循环、命运' },
  { name: '正义', emoji: '⚖️', meaning: '公平、真相、法律' },
  { name: '倒吊人', emoji: '🙃', meaning: '牺牲、新视角、等待' },
  { name: '死神', emoji: '💀', meaning: '结束、转变、重生' },
  { name: '节制', emoji: '🌈', meaning: '平衡、耐心、中庸' },
  { name: '恶魔', emoji: '😈', meaning: '束缚、物质、欲望' },
  { name: '高塔', emoji: '🗼', meaning: '突变、混乱、启示' },
  { name: '星星', emoji: '⭐', meaning: '希望、灵感、平静' },
  { name: '月亮', emoji: '🌝', meaning: '幻觉、直觉、潜意识' },
  { name: '太阳', emoji: '☀️', meaning: '成功、快乐、活力' },
  { name: '审判', emoji: '📯', meaning: '复活、觉醒、决断' },
  { name: '世界', emoji: '🌍', meaning: '完成、成就、旅行' }
]

async function handleDrawCards() {
  if (!question.value.trim() || isReading.value) return

  isReading.value = true
  aiResponse.value = ''
  drawnCards.value = []

  // 抽牌
  const cardCount = spreadType.value === 'single' ? 1 : 3
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)

  for (let i = 0; i < cardCount; i++) {
    const card = shuffled[i]
    const position = Math.random() > 0.5 ? 'upright' : 'reversed'
    drawnCards.value.push({
      ...card,
      position
    })
  }

  // 如果数字人已连接，切换到倾听状态
  if (avatarStore.isConnected) {
    avatarStore.setState('listen')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // 生成解读
  const cardNames = drawnCards.value.map(c => `${c.name}(${c.position === 'upright' ? '正位' : '逆位'})`)
  const prompt = generateTarotPrompt(cardNames, question.value)

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
        aiResponse.value = fullResponse
      },
      () => {
        // 完成后保存记录
        fortuneStore.addFortuneRecord({
          id: Date.now().toString(),
          type: 'tarot',
          question: question.value,
          result: fullResponse,
          timestamp: Date.now(),
          cards: cardNames
        })

        // 数字人说话
        if (avatarStore.isConnected && fullResponse) {
          avatarStore.setState('speak')
          avatarStore.speak(fullResponse, true, true)
        }

        isReading.value = false
      },
      (error) => {
        console.error('AI解读失败:', error)
        aiResponse.value = '解读失败：' + error
        isReading.value = false
      },
      avatarStore.keys.modelscope_api_key
    )
  } catch (error: any) {
    console.error('调用AI失败:', error)
    aiResponse.value = '调用AI失败：' + error.message
    isReading.value = false
  }
}
</script>
