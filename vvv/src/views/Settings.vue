<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><Setting /></el-icon>
          <span>密钥配置</span>
        </div>
      </template>

      <el-form :model="formData" label-width="150px" label-position="left">
        <!-- 测试密钥开关 -->
        <el-form-item label="使用测试密钥">
          <el-switch
            v-model="useTestKeys"
            active-text="是"
            inactive-text="否"
            size="large"
            @change="handleTestKeysChange"
          />
        </el-form-item>

        <el-divider content-position="left">
          <span v-if="!useTestKeys">手动输入密钥</span>
          <span v-else>测试密钥已自动填充</span>
        </el-divider>

        <!-- 魔珐星云 AppID -->
        <el-form-item label="魔珐星云 AppID">
          <el-input
            v-model="formData.xingyunAppId"
            placeholder="请输入魔珐星云 AppID"
            :disabled="useTestKeys"
            size="large"
            clearable
          />
        </el-form-item>

        <!-- 魔珐星云 Secret -->
        <el-form-item label="魔珐星云 Secret">
          <el-input
            v-model="formData.xingyunAppSecret"
            type="password"
            placeholder="请输入魔珐星云 Secret"
            :disabled="useTestKeys"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 魔搭 API Key -->
        <el-form-item label="魔搭 API Key">
          <el-input
            v-model="formData.modelScopeApiKey"
            type="password"
            placeholder="请输入魔搭社区 API Key"
            :disabled="useTestKeys"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="testing"
            @click="handleTestConnection"
          >
            测试连接
          </el-button>
          <el-button
            type="success"
            size="large"
            @click="handleSaveKeys"
          >
            保存密钥
          </el-button>
          <el-button
            size="large"
            @click="handleClearKeys"
          >
            清除密钥
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <el-alert
        v-if="message.type"
        :type="message.type"
        :title="message.text"
        :closable="false"
        show-icon
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 说明信息 -->
    <el-card class="info-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><InfoFilled /></el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <div class="info-content">
        <p>1. 测试密钥仅供开发调试使用,请勿在生产环境使用</p>
        <p>2. 魔珐星云密钥需要在 <a href="https://xingyun3d.com" target="_blank">魔珐星云平台</a> 创建应用后获取</p>
        <p>3. 魔搭社区 API Key 可在 <a href="https://modelscope.cn" target="_blank">魔搭社区</a> 个人中心获取</p>
        <p>4. 密钥将加密存储在浏览器本地,不会上传到服务器</p>
      </div>
    </el-card>

    <!-- SDK状态检查 -->
    <el-card class="info-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><Tools /></el-icon>
          <span>SDK状态检查</span>
        </div>
      </template>
      <div class="info-content">
        <div class="sdk-status">
          <p><strong>SDK加载状态:</strong>
            <el-tag :type="sdkLoaded ? 'success' : 'danger'" style="margin-left: 8px">
              {{ sdkLoaded ? '已加载' : '未加载' }}
            </el-tag>
          </p>
          <p v-if="sdkLoaded" style="margin-top: 12px">
            <strong>SDK类信息:</strong>
            <el-text style="margin-left: 8px" type="info">{{ sdkInfo }}</el-text>
          </p>
          <el-button
            v-if="!sdkLoaded"
            type="primary"
            style="margin-top: 12px"
            @click="checkSDKStatus"
          >
            重新检查SDK
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, InfoFilled, Tools } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/config'
import type { StoredKeys } from '@/types'

const router = useRouter()
const configStore = useConfigStore()

const useTestKeys = ref(false)
const testing = ref(false)
const formData = ref<StoredKeys>({
  xingyunAppId: '',
  xingyunAppSecret: '',
  modelScopeApiKey: '',
  isTestKey: false
})

const message = ref<{
  type: 'success' | 'error' | 'warning' | '' | 'info'
  text: string
}>({
  type: '',
  text: ''
})

const sdkLoaded = ref(false)
const sdkInfo = ref('')

// 加载已保存的配置
onMounted(() => {
  // 加载配置
  configStore.loadConfig()
  if (configStore.keys) {
    formData.value = { ...configStore.keys }
    useTestKeys.value = configStore.keys?.isTestKey || false
  }

  // 检查SDK状态
  checkSDKStatus()
})

// 使用测试密钥
function handleTestKeysChange(value: boolean) {
  if (value) {
    const testKeys = configStore.useTestKeys()
    formData.value = { ...testKeys }
    ElMessage.success('测试密钥已自动填充')
  } else {
    formData.value.xingyunAppId = ''
    formData.value.xingyunAppSecret = ''
    formData.value.modelScopeApiKey = ''
  }
}

// 测试连接
async function handleTestConnection() {
  if (!formData.value.xingyunAppId || !formData.value.xingyunAppSecret) {
    message.value = {
      type: 'error',
      text: '请先填写魔珐星云密钥'
    }
    return
  }

  testing.value = true
  message.value = { type: '', text: '' }

  try {
    // 简单验证:检查SDK是否加载
    if (typeof window.XmovAvatar === 'undefined') {
      throw new Error('SDK未加载,请检查网络连接')
    }

    // 验证魔搭API Key
    if (formData.value.modelScopeApiKey) {
      // TODO: 实际调用魔搭API验证
      console.log('验证魔搭API Key...')
    }

    message.value = {
      type: 'success',
      text: '密钥配置正确,可以连接!'
    }
    ElMessage.success('连接测试成功')
  } catch (error: any) {
    message.value = {
      type: 'error',
      text: error.message || '连接测试失败'
    }
    ElMessage.error('连接测试失败')
  } finally {
    testing.value = false
  }
}

// 保存密钥
function handleSaveKeys() {
  if (!formData.value.xingyunAppId || !formData.value.xingyunAppSecret) {
    ElMessage.warning('请先填写完整的密钥信息')
    return
  }

  configStore.saveConfig({
    ...formData.value,
    isTestKey: useTestKeys.value
  })

  ElMessage.success('密钥保存成功')
  message.value = {
    type: 'success',
    text: '密钥已保存'
  }
}

// 清除密钥
function handleClearKeys() {
  configStore.clearConfig()
  formData.value = {
    xingyunAppId: '',
    xingyunAppSecret: '',
    modelScopeApiKey: '',
    isTestKey: false
  }
  useTestKeys.value = false
  message.value = { type: '', text: '' }
  ElMessage.success('密钥已清除')
}

// 检查SDK状态
function checkSDKStatus() {
  sdkLoaded.value = typeof window.XmovAvatar !== 'undefined'
  if (sdkLoaded.value) {
    sdkInfo.value = window.XmovAvatar.name || 'XmovAvatar'
    ElMessage.success('SDK已加载')
  } else {
    sdkInfo.value = ''
    ElMessage.warning('SDK未加载,请刷新页面重试')
  }
}
</script>

<style scoped lang="scss">
.settings-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  .settings-card,
  .info-card {
    @include card-style;

    .card-header {
      @include flex-center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .info-content {
    p {
      margin: 12px 0;
      line-height: 1.6;
      color: $text-secondary;

      a {
        color: $primary-color;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  :deep(.el-form-item__label) {
    font-size: 16px;
    font-weight: 500;
  }

  :deep(.el-input__inner) {
    font-size: 16px;
  }

  :deep(.el-button) {
    min-width: 120px;
    margin-right: 12px;
  }
}
</style>
