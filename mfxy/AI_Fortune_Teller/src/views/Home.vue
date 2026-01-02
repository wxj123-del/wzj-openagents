<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- 标题 -->
    <div class="text-center mb-6">
      <h1 class="mystic-title text-3xl md:text-4xl mb-2">✨ AI占卜师</h1>
      <p class="text-gray-300">探索未知,揭示命运</p>
    </div>

    <!-- 主布局:左侧数字人竖屏,右侧功能模块 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- 左侧:数字人竖屏容器 (占4列) -->
      <div class="lg:col-span-4">
        <div class="mystic-card p-4 sticky top-4">
          <!-- 数字人竖屏容器 - 与simple-test.html保持一致 -->
          <div class="flex justify-center mb-4">
            <div
              id="avatar-container"
              ref="avatarContainerRef"
              style="
                width: 360px;
                height: 500px;
                position: relative;
                overflow: visible;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(107, 70, 193, 0.5);
                border-radius: 12px;
                display: block;
              "
            >
              <!-- 未连接提示 -->
              <div
                v-if="!avatarStore.isConnected"
                style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;"
              >
                <!-- 数字人占位符 -->
                <div style="font-size: 120px; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🔮</div>
                <div style="color: #D1D5DB; font-size: 18px; text-align: center; padding: 0 20px; font-weight: 600;">AI占卜师</div>
                <div style="color: #9CA3AF; font-size: 14px; margin-top: 12px; text-align: center; padding: 0 20px;">请先配置密钥并连接</div>

                <!-- 连接提示 -->
                <div v-if="avatarStore.connectionError" style="margin-top: 20px; padding: 12px; background: rgba(239, 68, 68, 0.2); border-radius: 8px; max-width: 80%;">
                  <div style="color: #FCA5A5; font-size: 13px; text-align: center;">
                    {{ getErrorMessage(avatarStore.connectionError) }}
                  </div>
                </div>
              </div>

              <!-- 加载进度 -->
              <div
                v-if="avatarStore.loadingProgress > 0 && avatarStore.loadingProgress < 100"
                style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index: 10;"
              >
                <div style="color: #F6E05E; font-size: 18px; margin-bottom: 16px;">正在连接数字人...</div>
                <div style="width: 200px; height: 6px; background: #374151; border-radius: 6px; overflow: hidden;">
                  <div
                    style="height: 100%; background: linear-gradient(to right, #6B46C1, #F6E05E); transition: width 0.3s;"
                    :style="{ width: avatarStore.loadingProgress + '%' }"
                  ></div>
                </div>
                <div style="color: #D1D5DB; margin-top: 8px; font-size: 14px;">{{ avatarStore.loadingProgress }}%</div>
              </div>
            </div>
          </div>

          <!-- 数字人控制按钮 -->
          <div class="space-y-2">
            <button
              @click="handleConnect"
              :disabled="isConnecting || avatarStore.isConnected"
              class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isConnecting ? '连接中...' : avatarStore.isConnected ? '已连接' : '连接数字人' }}
            </button>

            <button
              v-if="avatarStore.isConnected"
              @click="handleDisconnect"
              class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              断开连接
            </button>

            <div class="text-center text-sm mt-3">
              <div class="text-gray-300">状态:
                <span :class="avatarStore.isConnected ? 'text-green-400' : 'text-yellow-400'" class="font-semibold">
                  {{ avatarStore.isConnected ? '在线' : '离线' }}
                </span>
              </div>
              <div v-if="avatarStore.isConnected" class="text-gray-300 mt-1">
                当前: <span style="color: #F6E05E;">{{ stateText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧:功能模块 (占8列) -->
      <div class="lg:col-span-8 space-y-6">

        <!-- 功能切换Tab -->
        <div class="mystic-card">
          <div class="flex gap-2">
            <button
              @click="activeTab = 'tarot'"
              :class="activeTab === 'tarot' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="flex-1 px-6 py-3 rounded-lg text-white font-semibold hover:bg-mystic-purple/70 transition-all"
            >
              🃏 塔罗占卜
            </button>
            <button
              @click="activeTab = 'horoscope'"
              :class="activeTab === 'horoscope' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="flex-1 px-6 py-3 rounded-lg text-white font-semibold hover:bg-mystic-purple/70 transition-all"
            >
              ⭐ 星座运势
            </button>
            <button
              @click="activeTab = 'history'"
              :class="activeTab === 'history' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
              class="flex-1 px-6 py-3 rounded-lg text-white font-semibold hover:bg-mystic-purple/70 transition-all"
            >
              📜 历史记录
            </button>
          </div>
        </div>

        <!-- 塔罗占卜面板 -->
        <div v-if="activeTab === 'tarot'" class="mystic-card">
          <h2 class="text-2xl font-bold text-mystic-gold mb-6">🃏 塔罗占卜</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- 左侧:输入和控制 -->
            <div class="space-y-4">
              <!-- 问题输入 -->
              <div>
                <label class="block text-gray-300 text-sm mb-2">您想问什么?</label>
                <textarea
                  v-model="tarotQuestion"
                  class="mystic-input min-h-[100px] resize-none"
                  placeholder="请输入您想要咨询的问题..."
                ></textarea>
              </div>

              <!-- 牌阵选择 -->
              <div>
                <label class="block text-gray-300 text-sm mb-2">选择牌阵</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="tarotSpreadType = 'single'"
                    :class="tarotSpreadType === 'single' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
                    class="px-4 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
                  >
                    单张牌
                  </button>
                  <button
                    @click="tarotSpreadType = 'three'"
                    :class="tarotSpreadType === 'three' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
                    class="px-4 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
                  >
                    三张牌
                  </button>
                </div>
              </div>

              <!-- 抽牌按钮 -->
              <button
                @click="handleDrawCards"
                :disabled="!tarotQuestion.trim() || tarotIsReading"
                class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="tarotIsReading">解读中...</span>
                <span v-else>开始抽牌</span>
              </button>

              <!-- 抽到的牌 -->
              <div v-if="drawnTarotCards.length > 0" class="space-y-2">
                <h3 class="text-lg font-bold text-mystic-gold">抽到的牌</h3>
                <div class="space-y-2">
                  <div
                    v-for="(card, index) in drawnTarotCards"
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

            <!-- 右侧:解读结果 -->
            <div>
              <h3 class="text-lg font-bold text-mystic-gold mb-3">📜 塔罗解读</h3>
              <div class="mystic-input min-h-[400px] max-h-[500px] overflow-y-auto">
                <div v-if="tarotAiResponse" class="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {{ tarotAiResponse }}
                </div>
                <div v-else class="text-center text-gray-400 py-8">
                  {{ tarotIsReading ? '数字人正在解读...' : '塔罗解读将在这里显示' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 星座运势面板 -->
        <div v-if="activeTab === 'horoscope'" class="mystic-card">
          <h2 class="text-2xl font-bold text-mystic-gold mb-6">⭐ 星座运势</h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- 左侧:选择和控制 -->
            <div class="space-y-4">
              <!-- 星座选择 -->
              <div>
                <label class="block text-gray-300 text-sm mb-2">选择您的星座</label>
                <select v-model="selectedZodiac" class="mystic-input">
                  <option value="">请选择星座</option>
                  <option v-for="sign in ZODIAC_SIGNS" :key="sign.name" :value="sign.name">
                    {{ sign.name }} ({{ sign.date }})
                  </option>
                </select>
              </div>

              <!-- 时间范围 -->
              <div>
                <label class="block text-gray-300 text-sm mb-2">时间范围</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    @click="horoscopePeriod = '今日'"
                    :class="horoscopePeriod === '今日' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
                    class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
                  >
                    今日
                  </button>
                  <button
                    @click="horoscopePeriod = '本周'"
                    :class="horoscopePeriod === '本周' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
                    class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
                  >
                    本周
                  </button>
                  <button
                    @click="horoscopePeriod = '本月'"
                    :class="horoscopePeriod === '本月' ? 'bg-mystic-purple' : 'bg-mystic-purple/30'"
                    class="px-3 py-2 rounded-lg text-white text-sm hover:bg-mystic-purple/70 transition-all"
                  >
                    本月
                  </button>
                </div>
              </div>

              <!-- 查询按钮 -->
              <button
                @click="handleQueryHoroscope"
                :disabled="!selectedZodiac || horoscopeIsLoading"
                class="w-full mystic-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="horoscopeIsLoading">查询中...</span>
                <span v-else>查询运势</span>
              </button>

              <!-- 星座信息卡片 -->
              <div v-if="selectedZodiac" class="p-4 bg-mystic-purple/20 rounded-lg">
                <div class="text-center">
                  <div class="text-6xl mb-3">{{ getZodiacEmoji(selectedZodiac) }}</div>
                  <h3 class="text-2xl font-bold text-mystic-gold mb-2">{{ selectedZodiac }}</h3>
                  <p class="text-gray-400 text-sm">{{ getZodiacDate(selectedZodiac) }}</p>
                  <p class="text-gray-300 mt-2">属性:{{ getZodiacElement(selectedZodiac) }}</p>
                </div>
              </div>
            </div>

            <!-- 右侧:运势结果 -->
            <div>
              <h3 class="text-lg font-bold text-mystic-gold mb-3">🌟 运势详情</h3>
              <div class="mystic-input min-h-[400px] max-h-[500px] overflow-y-auto">
                <div v-if="horoscopeResult" class="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {{ horoscopeResult }}
                </div>
                <div v-else class="text-center text-gray-400 py-8">
                  {{ horoscopeIsLoading ? '数字人正在解读...' : '运势详情将在这里显示' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史记录面板 -->
        <div v-if="activeTab === 'history'" class="mystic-card">
          <h2 class="text-2xl font-bold text-mystic-gold mb-6">📜 历史记录</h2>

          <div v-if="fortuneStore.history.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-gray-300">暂无占卜记录</p>
            <p class="text-gray-400 text-sm mt-2">开始您的第一次占卜吧</p>
          </div>

          <div v-else class="space-y-4 max-h-[600px] overflow-y-auto">
            <div
              v-for="record in fortuneStore.history"
              :key="record.id"
              class="p-4 bg-white/5 rounded-lg border border-mystic-purple/30 hover:border-mystic-purple/50 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="text-xl">{{ typeIcon(record.type) }}</span>
                  <span class="text-mystic-gold font-semibold text-sm">{{ typeName(record.type) }}</span>
                </div>
                <span class="text-xs text-gray-400">{{ formatDate(record.timestamp) }}</span>
              </div>
              <div class="text-sm text-gray-200 mb-2">{{ record.question }}</div>
              <div class="text-sm text-gray-300 line-clamp-3">{{ record.result }}</div>
            </div>
          </div>
        </div>

        <!-- 设置卡片 -->
        <div class="mystic-card">
          <h3 class="text-xl font-bold text-mystic-gold mb-4">⚙️ 设置</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div class="text-gray-300 text-sm font-semibold">API密钥</div>
                <div class="text-gray-400 text-xs">配置星云和魔搭密钥</div>
              </div>
              <button
                @click="showKeyConfig = !showKeyConfig"
                class="px-4 py-2 bg-mystic-purple/50 hover:bg-mystic-purple/70 text-white rounded-lg text-sm transition-colors"
              >
                {{ showKeyConfig ? '收起' : '配置' }}
              </button>
            </div>

            <!-- 密钥配置表单 -->
            <div v-if="showKeyConfig" class="space-y-3 mt-4 p-4 bg-mystic-purple/10 rounded-lg">
              <div>
                <label class="block text-gray-300 text-xs mb-1">星云 App ID</label>
                <input
                  v-model="localKeys.xingyun_appId"
                  type="text"
                  class="mystic-input text-sm"
                  placeholder="输入星云 App ID"
                >
              </div>
              <div>
                <label class="block text-gray-300 text-xs mb-1">星云 App Secret</label>
                <input
                  v-model="localKeys.xingyun_appSecret"
                  type="password"
                  class="mystic-input text-sm"
                  placeholder="输入星云 App Secret"
                >
              </div>
              <div>
                <label class="block text-gray-300 text-xs mb-1">魔搭 API Key</label>
                <input
                  v-model="localKeys.modelscope_api_key"
                  type="password"
                  class="mystic-input text-sm"
                  placeholder="输入魔搭 API Key"
                >
              </div>
              <div class="flex gap-2">
                <button
                  @click="saveKeys"
                  class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  保存密钥
                </button>
                <button
                  @click="useTestKeys"
                  class="flex-1 px-4 py-2 bg-mystic-purple hover:bg-mystic-purple/70 text-white rounded-lg text-sm transition-colors"
                >
                  使用测试密钥
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { useFortuneStore } from '@/stores/fortune'
import { loadAvatarSDK } from '@/services/avatarAPI'
import { generateTarotPrompt, generateHoroscopePrompt, callModelStream } from '@/services/modelAPI'
import { ZODIAC_SIGNS, TEST_KEYS, AVATAR_STATES } from '@/utils/constants'

const avatarStore = useAvatarStore()
const fortuneStore = useFortuneStore()
const avatarContainerRef = ref<HTMLElement | null>(null)
const isConnecting = ref(false)

// Tab切换
const activeTab = ref<'tarot' | 'horoscope' | 'history'>('tarot')

// 塔罗占卜状态
const tarotQuestion = ref('')
const tarotSpreadType = ref<'single' | 'three'>('single')
const drawnTarotCards = ref<any[]>([])
const tarotAiResponse = ref('')
const tarotIsReading = ref(false)

// 星座运势状态
const selectedZodiac = ref('')
const horoscopePeriod = ref('今日')
const horoscopeResult = ref('')
const horoscopeIsLoading = ref(false)

// 设置状态
const showKeyConfig = ref(false)
const localKeys = ref({
  xingyun_appId: '',
  xingyun_appSecret: '',
  modelscope_api_key: ''
})

// 塔罗牌数据
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

// 数字人状态文本
const stateText = computed(() => {
  const stateMap: Record<string, string> = {
    [AVATAR_STATES.IDLE]: '待机',
    [AVATAR_STATES.LISTEN]: '倾听',
    [AVATAR_STATES.THINK]: '思考',
    [AVATAR_STATES.SPEAK]: '说话',
    [AVATAR_STATES.INTERACTIVE_IDLE]: '互动待机'
  }
  return stateMap[avatarStore.currentState] || avatarStore.currentState
})

// 数字人连接 - 优化版本
async function handleConnect() {
  if (!avatarStore.canConnect || isConnecting.value) return

  isConnecting.value = true

  try {
    // 先断开之前的连接
    if (avatarStore.isConnected) {
      console.log('先断开之前的连接')
      avatarStore.disconnect()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 加载SDK
    console.log('加载SDK...')
    await loadAvatarSDK()

    // 创建SDK实例
    console.log('创建SDK实例...')
    const success = avatarStore.createSDK('avatar-container')
    if (!success) {
      throw new Error(avatarStore.connectionError || '创建SDK实例失败')
    }

    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 800))

    // 初始化SDK
    console.log('初始化SDK...')
    const initSuccess = await avatarStore.initSDK()
    if (!initSuccess) {
      throw new Error(avatarStore.connectionError || '初始化SDK失败')
    }

    // 检查是否真的成功
    await new Promise(resolve => setTimeout(resolve, 2000))

    const container = document.getElementById('avatar-container')
    if (container) {
      const canvases = container.querySelectorAll('canvas')
      let hasLargeCanvas = false

      canvases.forEach(canvas => {
        if (canvas.width > 500 && canvas.height > 400) {
          hasLargeCanvas = true
        }
      })

      if (!hasLargeCanvas) {
        throw new Error('数字人加载失败,可能是会话限流。请等待10-15分钟后重试,或使用新的App ID')
      }
    }

    // 切换到待机状态
    setTimeout(() => {
      avatarStore.setState('idle')
    }, 500)

  } catch (error: any) {
    console.error('连接失败:', error)

    // 显示详细错误信息
    const errorMsg = error.message || '未知错误'
    avatarStore.connectionError = errorMsg

    // 提供解决方案
    if (errorMsg.includes('限流') || errorMsg.includes('10005')) {
      avatarStore.connectionError += '\n\n解决方案:\n1. 等待10-15分钟让会话过期\n2. 或注册新的星云账号获取新App ID\n3. AI占卜功能仍然可用,只是没有数字人'
    }
  } finally {
    isConnecting.value = false
  }
}

// 错误信息解析
function getErrorMessage(error: string): string {
  if (error.includes('限流') || error.includes('10005')) {
    return '⚠️ 数字人会话限流\n\n请等待10-15分钟后再试\nAI功能仍可正常使用'
  } else if (error.includes('容器')) {
    return '🔧 容器错误\n\n请刷新页面重试'
  } else if (error.includes('密钥')) {
    return '🔑 密钥错误\n\n请在设置中配置正确的密钥'
  } else {
    return error || '连接失败,请重试'
  }
}

function handleDisconnect() {
  avatarStore.disconnect()
}

// 塔罗占卜
async function handleDrawCards() {
  if (!tarotQuestion.value.trim() || tarotIsReading.value) return

  tarotIsReading.value = true
  tarotAiResponse.value = ''
  drawnTarotCards.value = []

  // 抽牌
  const cardCount = tarotSpreadType.value === 'single' ? 1 : 3
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)

  for (let i = 0; i < cardCount; i++) {
    const card = shuffled[i]
    const position = Math.random() > 0.5 ? 'upright' : 'reversed'
    drawnTarotCards.value.push({
      ...card,
      position
    })
  }

  // 数字人状态切换
  if (avatarStore.isConnected) {
    avatarStore.setState('listen')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const cardNames = drawnTarotCards.value.map(c => `${c.name}(${c.position === 'upright' ? '正位' : '逆位'})`)
  const prompt = generateTarotPrompt(cardNames, tarotQuestion.value)

  if (avatarStore.isConnected) {
    avatarStore.setState('think')
  }

  let fullResponse = ''

  try {
    if (!avatarStore.keys?.modelscope_api_key) {
      throw new Error('请先配置魔搭API密钥')
    }

    await callModelStream(
      [{ role: 'user', content: prompt }],
      (chunk) => {
        fullResponse += chunk
        tarotAiResponse.value = fullResponse
      },
      () => {
        fortuneStore.addFortuneRecord({
          id: Date.now().toString(),
          type: 'tarot',
          question: tarotQuestion.value,
          result: fullResponse,
          timestamp: Date.now(),
          cards: cardNames
        })

        if (avatarStore.isConnected && fullResponse) {
          avatarStore.setState('speak')
          avatarStore.speak(fullResponse, true, true)
        }

        tarotIsReading.value = false
      },
      (error) => {
        console.error('AI解读失败:', error)
        tarotAiResponse.value = '解读失败:' + error
        tarotIsReading.value = false
      },
      avatarStore.keys.modelscope_api_key
    )
  } catch (error: any) {
    console.error('调用AI失败:', error)
    tarotAiResponse.value = '调用AI失败:' + error.message
    tarotIsReading.value = false
  }
}

// 星座运势
async function handleQueryHoroscope() {
  if (!selectedZodiac.value || horoscopeIsLoading.value) return

  horoscopeIsLoading.value = true
  horoscopeResult.value = ''

  if (avatarStore.isConnected) {
    avatarStore.setState('listen')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const prompt = generateHoroscopePrompt(selectedZodiac.value, horoscopePeriod.value)

  if (avatarStore.isConnected) {
    avatarStore.setState('think')
  }

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
        fortuneStore.addFortuneRecord({
          id: Date.now().toString(),
          type: 'horoscope',
          question: `${selectedZodiac.value}${horoscopePeriod.value}运势`,
          result: fullResponse,
          timestamp: Date.now(),
          zodiac: selectedZodiac.value
        })

        if (avatarStore.isConnected && fullResponse) {
          avatarStore.setState('speak')
          avatarStore.speak(fullResponse, true, true)
        }

        horoscopeIsLoading.value = false
      },
      (error) => {
        console.error('运势查询失败:', error)
        horoscopeResult.value = '查询失败:' + error
        horoscopeIsLoading.value = false
      },
      avatarStore.keys.modelscope_api_key
    )
  } catch (error: any) {
    console.error('调用AI失败:', error)
    horoscopeResult.value = '调用AI失败:' + error.message
    horoscopeIsLoading.value = false
  }
}

// 星座辅助函数
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

// 历史记录辅助函数
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
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 密钥管理
function saveKeys() {
  avatarStore.setKeys(localKeys.value)
  showKeyConfig.value = false
  alert('密钥已保存')
}

function useTestKeys() {
  localKeys.value = { ...TEST_KEYS }
  avatarStore.setKeys(TEST_KEYS)
  alert('已使用测试密钥')
}

onMounted(() => {
  const container = document.getElementById('avatar-container')
  console.log('容器检查:', container)
})
</script>
