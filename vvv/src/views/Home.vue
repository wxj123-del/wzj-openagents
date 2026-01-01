<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <h1 class="title">VON政务大厅智能指引系统</h1>
        <div class="header-actions">
          <el-button
            type="primary"
            size="large"
            @click="router.push('/settings')"
          >
            <el-icon><Setting /></el-icon>
            设置
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧:数字人区域 -->
      <div class="avatar-section">
        <el-card class="avatar-card">
          <template #header>
            <div class="card-header">
              <span>智能助手</span>
              <el-tag :type="avatarStore.isConnected ? 'success' : 'danger'">
                {{ avatarStore.isConnected ? '在线' : '离线' }}
              </el-tag>
            </div>
          </template>

          <!-- 数字人容器 -->
          <div
            v-show="avatarStore.isConnected"
            id="avatar-container"
            class="avatar-container"
          ></div>

          <!-- 未连接提示 -->
          <div v-show="!avatarStore.isConnected" class="avatar-placeholder">
            <el-empty description="数字人未连接">
              <el-button type="primary" @click="connectAvatar">
                连接数字人
              </el-button>
            </el-empty>
          </div>

          <!-- 控制面板 -->
          <div v-if="avatarStore.isConnected" class="avatar-controls">
            <el-button-group>
              <el-button @click="avatarStore.setState('listen')">倾听</el-button>
              <el-button @click="avatarStore.setState('think')">思考</el-button>
              <el-button @click="avatarStore.setState('interactive_idle')">待机</el-button>
              <el-button @click="avatarStore.setState('offline')">离线</el-button>
            </el-button-group>
            <el-button type="danger" @click="disconnectAvatar">断开连接</el-button>
          </div>

          <!-- 状态显示 -->
          <div v-if="avatarStore.isConnected" class="avatar-status">
            <span>状态: {{ avatarStore.currentState }}</span>
          </div>
        </el-card>
      </div>

      <!-- 右侧:业务分类和对话区 -->
      <div class="right-section">
        <!-- 热门业务分类 -->
        <el-card class="business-card">
          <template #header>
            <div class="card-header">
              <el-icon><Grid /></el-icon>
              <span>热门业务分类</span>
              <el-button text type="primary" @click="router.push('/business')">
                查看全部 →
              </el-button>
            </div>
          </template>

          <div class="business-grid">
            <div
              v-for="business in featuredBusiness"
              :key="business.id"
              class="business-item"
              @click="handleBusinessClick(business)"
            >
              <el-icon :size="32" :color="getCategoryColor(business.category)">
                <component :is="business.icon" />
              </el-icon>
              <span class="business-name">{{ business.name }}</span>
            </div>
          </div>
        </el-card>

        <!-- 智能问答区 -->
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>智能问答</span>
            </div>
          </template>

          <!-- 对话历史 -->
          <div class="chat-history">
            <div
              v-for="msg in chatStore.messages"
              :key="msg.id"
              :class="['chat-message', msg.role]"
            >
              <div class="message-avatar">
                <el-icon v-if="msg.role === 'user'"><User /></el-icon>
                <el-icon v-else><Service /></el-icon>
              </div>
              <div class="message-content">{{ msg.content }}</div>
            </div>

            <!-- 流式响应中显示 -->
            <div v-if="chatStore.isLoading && streamingResponse" class="chat-message assistant">
              <div class="message-avatar">
                <el-icon><Service /></el-icon>
              </div>
              <div class="message-content">
                {{ streamingResponse }}
                <span class="cursor">|</span>
              </div>
            </div>

            <!-- 加载中提示 -->
            <div v-if="chatStore.isLoading && !streamingResponse" class="chat-message assistant">
              <div class="message-avatar">
                <el-icon><Service /></el-icon>
              </div>
              <div class="message-content">
                <span class="loading-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </span>
              </div>
            </div>

            <div v-if="chatStore.messages.length === 0 && !chatStore.isLoading" class="chat-empty">
              <p>您好!我是政务智能助手,请问有什么可以帮您?</p>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="请输入您的问题..."
              @keydown.enter.ctrl="handleSend"
            />
            <div class="input-actions">
              <el-button
                type="primary"
                :loading="chatStore.isLoading"
                :disabled="!inputMessage.trim()"
                @click="handleSend"
              >
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Grid,
  ChatDotRound,
  User,
  Service
} from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/config'
import { useAvatarStore } from '@/stores/avatar'
import { useChatStore } from '@/stores/chat'
import { businessData } from '@/data/businessData'
import { callModelScopeAPI } from '@/services/modelScopeService'

const router = useRouter()
const configStore = useConfigStore()
const avatarStore = useAvatarStore()
const chatStore = useChatStore()

const inputMessage = ref('')
const streamingResponse = ref('') // 流式响应的临时文本

// 精选业务(前6个)
const featuredBusiness = computed(() => businessData.slice(0, 6))

// 获取业务分类颜色
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    公安: '#1890ff',
    人社: '#52c41a',
    公积金: '#faad14',
    市场监管: '#722ed1',
    税务: '#eb2f96'
  }
  return colorMap[category] || '#1890ff'
}

// 点击业务卡片
function handleBusinessClick(business: any) {
  router.push(`/business/${business.id}`)
}

// 连接数字人
async function connectAvatar() {
  if (!configStore.keys?.xingyunAppId || !configStore.keys?.xingyunAppSecret) {
    ElMessage.warning('请先在设置页面配置密钥')
    router.push('/settings')
    return
  }

  // 检查SDK是否加载
  if (typeof window.XmovAvatar === 'undefined') {
    ElMessage.error('SDK正在加载中,请稍后再试')
    console.error('XmovAvatar SDK 未加载')
    return
  }

  console.log('开始连接数字人...')
  console.log('AppID:', configStore.keys.xingyunAppId)
  console.log('SDK类:', window.XmovAvatar)

  const loading = ElMessage({
    message: '正在连接数字人...',
    type: 'info',
    duration: 0
  })

  try {
    const success = await avatarStore.init(
      'avatar-container',
      configStore.keys.xingyunAppId,
      configStore.keys.xingyunAppSecret
    )

    loading.close()

    if (success) {
      ElMessage.success('数字人连接成功')
      // 欢迎语
      setTimeout(() => {
        avatarStore.speak('欢迎使用VON政务大厅智能指引系统', true, true)
      }, 1000)
    } else {
      ElMessage.error('数字人连接失败: ' + avatarStore.errorMessage)
    }
  } catch (error: any) {
    loading.close()
    console.error('连接数字人异常:', error)
    ElMessage.error('连接失败: ' + (error.message || '未知错误'))
  }
}

// 断开数字人连接
function disconnectAvatar() {
  avatarStore.destroy()
  ElMessage.info('数字人已断开连接')
}

// 发送消息
async function handleSend() {
  const message = inputMessage.value.trim()
  if (!message) return

  // 检查API Key
  if (!configStore.keys?.modelScopeApiKey) {
    ElMessage.warning('请先在设置页面配置魔搭API Key')
    router.push('/settings')
    return
  }

  // 添加用户消息
  chatStore.addUserMessage(message)
  inputMessage.value = ''

  // 如果数字人已连接,进入倾听状态
  if (avatarStore.isConnected) {
    avatarStore.setState('listen')
  }

  chatStore.isLoading = true

  try {
    // 如果数字人已连接,切换到思考状态
    if (avatarStore.isConnected) {
      await new Promise(resolve => setTimeout(resolve, 500))
      avatarStore.setState('think')
    }

    // 清空之前的流式响应
    streamingResponse.value = ''

    // 调用AI获取回复
    const response = await callModelScopeAPI(
      chatStore.messages,
      configStore.keys.modelScopeApiKey,
      (chunk) => {
        // 流式处理:实时显示AI回复
        streamingResponse.value += chunk
      }
    )

    console.log('AI回复:', response)

    // 清空流式显示
    streamingResponse.value = ''

    // 添加助手消息
    chatStore.addAssistantMessage(response)

    // 如果数字人已连接,播放语音
    if (avatarStore.isConnected) {
      // 等待思考状态完成
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 流式播放
      let isFirstChunk = true
      const chunks = response.split('').reduce((acc: string[], char, index) => {
        if (index % 20 === 0) {
          acc.push('')
        }
        acc[acc.length - 1] += char
        return acc
      }, [])

      for (const chunk of chunks) {
        avatarStore.speak(chunk, isFirstChunk, false)
        isFirstChunk = false
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // 发送结束标记
      avatarStore.speak('', false, true)
    }

    ElMessage.success('回复完成')
  } catch (error: any) {
    console.error('AI调用失败:', error)

    // 降级方案:使用简单的预设回复
    const fallbackResponse = `收到您的问题:"${message}"。我是政务智能助手,可以帮您解答各类政务办理问题。您可以点击业务卡片查看详情,或继续向我提问。`
    chatStore.addAssistantMessage(fallbackResponse)

    if (avatarStore.isConnected) {
      await new Promise(resolve => setTimeout(resolve, 500))
      avatarStore.speak(fallbackResponse, true, true)
    }

    ElMessage.error('AI服务暂时不可用,请稍后重试')
  } finally {
    chatStore.isLoading = false
  }
}

onMounted(() => {
  // 加载配置
  configStore.loadConfig()
})

onUnmounted(() => {
  // 清理数字人连接
  if (avatarStore.isConnected) {
    avatarStore.destroy()
  }
})
</script>

<style scoped lang="scss">
.home-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $background-color;

  .header {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: white;
    padding: 20px 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-content {
      @include flex-between;
      max-width: 1920px;
      margin: 0 auto;

      .title {
        font-size: 28px;
        font-weight: 600;
        margin: 0;
      }

      .header-actions {
        :deep(.el-button) {
          @include touch-button;
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 500px 1fr;
    gap: 20px;
    padding: 20px;
    overflow: hidden;

    .avatar-section {
      display: flex;
      flex-direction: column;

      .avatar-card {
        flex: 1;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .card-header {
          @include flex-between;
          font-size: 18px;
          font-weight: 600;
        }

        .avatar-container {
          flex: 1;
          min-height: 400px;
          border-radius: $border-radius-md;
          overflow: hidden;
        }

        .avatar-placeholder {
          flex: 1;
          @include flex-center;
          min-height: 400px;
        }

        .avatar-controls {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;

          :deep(.el-button) {
            min-width: 80px;
          }
        }

        .avatar-status {
          margin-top: 12px;
          padding: 8px;
          background: $background-color;
          border-radius: $border-radius-sm;
          font-size: 14px;
          color: $text-secondary;
        }
      }
    }

    .right-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: hidden;

      .business-card,
      .chat-card {
        :deep(.el-card__header) {
          padding: 16px 20px;
        }

        .card-header {
          @include flex-center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .business-card {
        :deep(.el-card__body) {
          padding: 20px;
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;

          .business-item {
            @include card-style;
            @include flex-column;
            @include flex-center;
            gap: 12px;
            padding: 24px 16px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-4px);
              box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
            }

            .business-name {
              font-size: 16px;
              font-weight: 500;
              text-align: center;
            }
          }
        }
      }

      .chat-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .chat-history {
          flex: 1;
          padding: 20px;
          overflow-y: auto;

          .chat-message {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;

            &.user {
              flex-direction: row-reverse;

              .message-content {
                background: $primary-color;
                color: white;
                border-radius: 16px 4px 16px 16px;
              }
            }

            &.assistant {
              .message-content {
                background: white;
                border: 1px solid #e8e8e8;
                border-radius: 4px 16px 16px 16px;
              }
            }

            .message-avatar {
              @include flex-center;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: $background-color;
              flex-shrink: 0;
            }

            .message-content {
              max-width: 60%;
              padding: 12px 16px;
              word-break: break-word;
            }
          }

          .chat-empty {
            @include flex-center;
            height: 100%;
            color: $text-secondary;
            font-size: 16px;
          }
        }

        .chat-input {
          border-top: 1px solid #e8e8e8;
          padding: 16px 20px;

          .input-actions {
            margin-top: 12px;
            display: flex;
            justify-content: flex-end;
          }
        }

        // 流式响应光标动画
        .cursor {
          display: inline-block;
          width: 2px;
          height: 16px;
          background: $primary-color;
          margin-left: 2px;
          animation: blink 1s infinite;
          vertical-align: middle;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        // 加载动画
        .loading-dots {
          display: inline-flex;
          gap: 4px;
          padding: 8px 0;

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $primary-color;
            animation: bounce 1.4s infinite ease-in-out both;

            &:nth-child(1) { animation-delay: -0.32s; }
            &:nth-child(2) { animation-delay: -0.16s; }
            &:nth-child(3) { animation-delay: 0s; }
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      }
    }
  }
}

// 大屏适配
@media (min-width: $screen-2k) {
  .home-container {
    .main-content {
      grid-template-columns: 600px 1fr;
      gap: 24px;
      padding: 24px;

      .right-section {
        .business-card .business-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;

          .business-item {
            padding: 28px 20px;

            .business-name {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}
</style>
