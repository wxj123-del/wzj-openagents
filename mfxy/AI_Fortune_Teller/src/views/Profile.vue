<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="mystic-title text-3xl mb-8">🔑 密钥配置</h1>

    <!-- 使用内置密钥 -->
    <div class="mystic-card">
      <h2 class="text-xl font-bold text-mystic-gold mb-4">快速开始</h2>
      <p class="text-gray-300 mb-4">使用内置测试密钥快速体验（仅用于测试）</p>
      <button
        @click="handleUseTestKeys"
        class="w-full mystic-btn"
      >
        使用内置测试密钥
      </button>
      <div v-if="avatarStore.useTestKeys" class="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
        <p class="text-green-300 text-sm">✓ 已使用内置测试密钥</p>
      </div>
    </div>

    <!-- 自定义密钥 -->
    <div class="mystic-card">
      <h2 class="text-xl font-bold text-mystic-gold mb-4">自定义密钥</h2>
      <p class="text-gray-300 mb-4">使用您自己的API密钥</p>

      <form @submit.prevent="handleSaveKeys" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm mb-2">魔珐星云 App ID</label>
          <input
            v-model="form.xingyun_appId"
            type="text"
            class="mystic-input"
            placeholder="请输入 App ID"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm mb-2">魔珐星云 App Secret</label>
          <input
            v-model="form.xingyun_appSecret"
            type="password"
            class="mystic-input"
            placeholder="请输入 App Secret"
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm mb-2">魔搭社区 API Key</label>
          <input
            v-model="form.modelscope_api_key"
            type="password"
            class="mystic-input"
            placeholder="请输入 API Key"
          />
        </div>

        <div class="flex space-x-3">
          <button
            type="submit"
            class="flex-1 mystic-btn"
          >
            保存密钥
          </button>
          <button
            type="button"
            @click="handleClearKeys"
            class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
          >
            清除
          </button>
        </div>
      </form>

      <div v-if="saveSuccess" class="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
        <p class="text-green-300 text-sm">✓ 密钥已保存</p>
      </div>
    </div>

    <!-- 密钥获取指南 -->
    <div class="mystic-card">
      <h2 class="text-xl font-bold text-mystic-gold mb-4">如何获取密钥</h2>
      <div class="space-y-4 text-gray-300 text-sm">
        <div>
          <h3 class="font-semibold text-mystic-gold mb-1">1. 魔珐星云密钥</h3>
          <p>访问 <a href="https://xingyun3d.com" target="_blank" class="text-mystic-gold hover:underline">xingyun3d.com</a>，注册并创建应用获取 App ID 和 Secret</p>
        </div>
        <div>
          <h3 class="font-semibold text-mystic-gold mb-1">2. 魔搭社区密钥</h3>
          <p>访问 <a href="https://modelscope.cn" target="_blank" class="text-mystic-gold hover:underline">modelscope.cn</a>，注册账号获取 API Key</p>
        </div>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
      <p class="text-yellow-300 text-sm">
        🔒 所有密钥都经过加密存储在您的浏览器本地，不会上传到任何服务器
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAvatarStore } from '@/stores/avatar'

const avatarStore = useAvatarStore()
const saveSuccess = ref(false)

const form = ref({
  xingyun_appId: '',
  xingyun_appSecret: '',
  modelscope_api_key: ''
})

onMounted(() => {
  if (avatarStore.keys) {
    form.value = { ...avatarStore.keys }
  }
})

function handleUseTestKeys() {
  avatarStore.useBuiltInKeys()
  form.value = { ...avatarStore.keys! }
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

function handleSaveKeys() {
  if (!form.value.xingyun_appId || !form.value.xingyun_appSecret || !form.value.modelscope_api_key) {
    alert('请填写所有密钥')
    return
  }

  avatarStore.updateKeys(form.value)
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

function handleClearKeys() {
  if (confirm('确定要清除已保存的密钥吗？')) {
    avatarStore.resetKeys()
    form.value = {
      xingyun_appId: '',
      xingyun_appSecret: '',
      modelscope_api_key: ''
    }
  }
}
</script>
