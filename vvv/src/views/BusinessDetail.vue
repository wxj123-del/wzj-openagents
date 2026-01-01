<template>
  <div class="business-detail-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          @click="router.back()"
        >
          返回
        </el-button>
        <h1 class="title">{{ business?.name }}</h1>
        <div style="width: 100px"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main v-if="business" class="main-content">
      <div class="detail-layout">
        <!-- 左侧:流程和材料 -->
        <div class="left-section">
          <!-- 基本信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            <div class="info-content">
              <div class="info-item">
                <span class="label">所属类别:</span>
                <el-tag>{{ business.category }}</el-tag>
              </div>
              <div class="info-item">
                <span class="label">预计时间:</span>
                <span class="value">{{ business.estimatedTime }}</span>
              </div>
              <p class="description">{{ business.description }}</p>
            </div>
          </el-card>

          <!-- 办理流程 -->
          <el-card class="process-card">
            <template #header>
              <div class="card-header">
                <el-icon><List /></el-icon>
                <span>办理流程 ({{ business.steps.length }}步)</span>
              </div>
            </template>
            <div class="process-flow">
              <div
                v-for="(step, index) in business.steps"
                :key="step.order"
                class="process-step"
              >
                <div class="step-number">{{ step.order }}</div>
                <div class="step-content">
                  <h4 class="step-title">{{ step.title }}</h4>
                  <p class="step-desc">{{ step.description }}</p>
                  <div v-if="step.location" class="step-location">
                    <el-icon><Location /></el-icon>
                    {{ step.location }}
                  </div>
                </div>
                <div
                  v-if="index < business.steps.length - 1"
                  class="step-arrow"
                >
                  <el-icon><ArrowDown /></el-icon>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 所需材料 -->
          <el-card class="materials-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>所需材料</span>
              </div>
            </template>
            <div class="materials-list">
              <div
                v-for="(material, index) in business.materials"
                :key="index"
                class="material-item"
              >
                <el-icon
                  :color="material.required ? '#52c41a' : '#faad14'"
                  :size="20"
                >
                  <component :is="material.required ? 'CircleCheck' : 'Warning'" />
                </el-icon>
                <div class="material-info">
                  <h5 class="material-name">
                    {{ material.name }}
                    <el-tag
                      v-if="material.required"
                      type="danger"
                      size="small"
                    >
                      必需
                    </el-tag>
                    <el-tag v-else type="warning" size="small">
                      可选
                    </el-tag>
                  </h5>
                  <p class="material-format">
                    格式: {{ material.format.join('、') || '无特殊要求' }}
                  </p>
                  <p v-if="material.remark" class="material-remark">
                    {{ material.remark }}
                  </p>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧:注意事项和操作 -->
        <div class="right-section">
          <!-- 注意事项 -->
          <el-card class="notes-card">
            <template #header>
              <div class="card-header">
                <el-icon><Warning /></el-icon>
                <span>注意事项</span>
              </div>
            </template>
            <ul class="notes-list">
              <li v-for="(note, index) in business.notes" :key="index">
                {{ note }}
              </li>
            </ul>
          </el-card>

          <!-- 相关政策 -->
          <el-card class="policies-card">
            <template #header>
              <div class="card-header">
                <el-icon><Files /></el-icon>
                <span>相关政策</span>
              </div>
            </template>
            <div class="policies-list">
              <div
                v-for="(policy, index) in business.policies"
                :key="index"
                class="policy-item"
              >
                <h5 class="policy-title">{{ policy.title }}</h5>
                <p class="policy-content">{{ policy.content }}</p>
              </div>
            </div>
          </el-card>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :icon="VideoPlay"
              @click="handleStartProcess"
            >
              开始办理
            </el-button>
            <el-button
              size="large"
              :icon="ChatDotRound"
              @click="handleAskQuestion"
            >
              咨询详情
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <!-- 未找到业务 -->
    <el-empty v-else description="未找到该业务信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowDown,
  InfoFilled,
  List,
  Document,
  Location,
  Warning,
  Files,
  VideoPlay,
  ChatDotRound,
  CircleCheck
} from '@element-plus/icons-vue'
import { businessData } from '@/data/businessData'

const router = useRouter()
const route = useRoute()

// 获取当前业务
const business = computed(() => {
  const id = route.params.id as string
  return businessData.find(b => b.id === id)
})

// 开始办理
function handleStartProcess() {
  ElMessage.success('开始办理流程')
  // TODO: 进入流程引导模式
}

// 咨询详情
function handleAskQuestion() {
  router.push({
    path: '/',
    query: { question: `请问如何办理${business.value?.name}?` }
  })
}
</script>

<style scoped lang="scss">
.business-detail-container {
  width: 100%;
  min-height: 100vh;
  background: $background-color;

  .header {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: white;
    padding: 20px 40px;

    .header-content {
      @include flex-between;
      max-width: 1600px;
      margin: 0 auto;

      .title {
        font-size: 28px;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .main-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 40px 20px;

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;

      .left-section {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .info-card,
        .process-card,
        .materials-card {
          .card-header {
            @include flex-center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }

          :deep(.el-card__body) {
            padding: 24px;
          }
        }

        .info-card {
          .info-content {
            .info-item {
              @include flex-center;
              margin-bottom: 16px;

              .label {
                font-weight: 500;
                margin-right: 12px;
                min-width: 100px;
              }

              .value {
                color: $primary-color;
                font-weight: 500;
              }
            }

            .description {
              line-height: 1.6;
              color: $text-secondary;
              margin: 16px 0 0 0;
            }
          }
        }

        .process-card {
          .process-flow {
            .process-step {
              display: flex;
              gap: 16px;
              position: relative;

              .step-number {
                @include flex-center;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: $primary-color;
                color: white;
                font-size: 20px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .step-content {
                flex: 1;
                padding-bottom: 32px;

                .step-title {
                  font-size: 18px;
                  font-weight: 600;
                  margin: 0 0 8px 0;
                  color: $text-primary;
                }

                .step-desc {
                  color: $text-secondary;
                  margin: 0 0 8px 0;
                  line-height: 1.5;
                }

                .step-location {
                  @include flex-center;
                  gap: 4px;
                  color: $primary-color;
                  font-size: 14px;
                }
              }

              .step-arrow {
                position: absolute;
                left: 22px;
                bottom: -16px;
                color: $text-secondary;
              }

              &:last-child {
                .step-content {
                  padding-bottom: 0;
                }

                .step-arrow {
                  display: none;
                }
              }
            }
          }
        }

        .materials-card {
          .materials-list {
            .material-item {
              @include flex-center;
              gap: 12px;
              padding: 16px;
              border-radius: $border-radius-md;
              background: $background-color;
              margin-bottom: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .material-info {
                flex: 1;

                .material-name {
                  @include flex-between;
                  font-size: 16px;
                  font-weight: 600;
                  margin: 0 0 8px 0;
                  color: $text-primary;
                }

                .material-format {
                  font-size: 14px;
                  color: $text-secondary;
                  margin: 0 0 4px 0;
                }

                .material-remark {
                  font-size: 13px;
                  color: $info-color;
                  margin: 0;
                }
              }
            }
          }
        }
      }

      .right-section {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .notes-card,
        .policies-card {
          .card-header {
            @include flex-center;
            gap: 8px;
            font-size: 18px;
            font-weight: 600;
          }

          :deep(.el-card__body) {
            padding: 20px;
          }
        }

        .notes-card {
          .notes-list {
            margin: 0;
            padding-left: 20px;

            li {
              margin-bottom: 12px;
              line-height: 1.6;
              color: $text-secondary;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }

        .policies-card {
          .policies-list {
            .policy-item {
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e8e8e8;

              &:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
              }

              .policy-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 8px 0;
                color: $text-primary;
              }

              .policy-content {
                font-size: 14px;
                line-height: 1.6;
                color: $text-secondary;
                margin: 0;
              }
            }
          }
        }

        .action-buttons {
          @include flex-column;
          gap: 12px;
          padding: 20px;
          background: white;
          border-radius: $border-radius-lg;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          :deep(.el-button) {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
