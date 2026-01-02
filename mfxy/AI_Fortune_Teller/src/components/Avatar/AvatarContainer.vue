<template>
  <div class="mystic-card">
    <div class="relative flex justify-center items-center">
      <!-- 数字人容器 -->
      <div
        id="avatar-container"
        ref="containerRef"
        style="width: 600px; height: 500px; position: relative; overflow: visible;"
      >
          <!-- 加载进度 -->
          <div v-if="avatarStore.loadingProgress > 0 && avatarStore.loadingProgress < 100" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 10;">
            <div style="color: #F6E05E; font-size: 20px; margin-bottom: 16px;">正在加载数字人...</div>
            <div style="width: 256px; height: 8px; background: #374151; border-radius: 8px; overflow: hidden;">
              <div
                style="height: 100%; background: linear-gradient(to right, #6B46C1, #F6E05E); transition: width 0.3s;"
                :style="{ width: avatarStore.loadingProgress + '%' }"
              ></div>
            </div>
            <div style="color: #D1D5DB; margin-top: 8px;">{{ avatarStore.loadingProgress }}%</div>
          </div>

          <!-- 未连接提示 -->
          <div v-if="!avatarStore.isConnected" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
            <div style="color: #D1D5DB; font-size: 18px;">数字人未连接</div>
            <div style="color: #9CA3AF; font-size: 14px; margin-top: 8px;">请先在设置中配置密钥并连接</div>
          </div>
        </div>

      <!-- 状态显示 -->
      <div v-if="avatarStore.isConnected" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 14px; color: #D1D5DB;">
          当前状态: <span style="color: #F6E05E; font-weight: 600;">{{ stateText }}</span>
        </div>
        <div v-if="avatarStore.isSpeaking" style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: #4ADE80; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <span style="font-size: 14px; color: #4ADE80;">说话中</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { AVATAR_STATES } from '@/utils/constants'

const avatarStore = useAvatarStore()
const containerRef = ref<HTMLDivElement | null>(null)

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

onMounted(() => {
  // 详细检查容器
  console.log('=== AvatarContainer Mounted ===')
  console.log('容器ref:', containerRef.value)
  console.log('容器ID:', containerRef.value?.id)
  console.log('容器尺寸:', containerRef.value?.offsetWidth, 'x', containerRef.value?.offsetHeight)
  console.log('容器位置:', containerRef.value?.getBoundingClientRect())
  console.log('容器父元素:', containerRef.value?.parentElement)
  console.log('容器computedStyle:', window.getComputedStyle(containerRef.value!))

  // 检查容器是否在DOM中
  const byId = document.getElementById('avatar-container')
  console.log('getElementById找到:', byId)
  console.log('是同一个元素:', byId === containerRef.value)
})
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
