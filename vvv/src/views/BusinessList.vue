<template>
  <div class="business-list-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          @click="router.push('/')"
        >
          返回首页
        </el-button>
        <h1 class="title">业务列表</h1>
        <div style="width: 100px"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <el-card>
        <!-- 分类筛选 -->
        <div class="category-tabs">
          <el-radio-group v-model="selectedCategory" size="large">
            <el-radio-button
              v-for="cat in businessCategories"
              :key="cat.id"
              :label="cat.id"
            >
              <el-icon><component :is="cat.icon" /></el-icon>
              {{ cat.name }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 业务列表 -->
        <div class="business-list">
          <div
            v-for="business in filteredBusiness"
            :key="business.id"
            class="business-card"
            @click="handleBusinessClick(business)"
          >
            <div class="business-icon">
              <el-icon :size="48" :color="getCategoryColor(business.category)">
                <component :is="business.icon" />
              </el-icon>
            </div>
            <div class="business-info">
              <h3 class="business-name">{{ business.name }}</h3>
              <p class="business-category">{{ business.category }}</p>
              <p class="business-desc">{{ business.description }}</p>
              <div class="business-meta">
                <el-tag type="info" size="small">
                  <el-icon><Clock /></el-icon>
                  {{ business.estimatedTime }}
                </el-tag>
                <span class="step-count">
                  {{ business.steps.length }} 个步骤
                </span>
              </div>
            </div>
            <el-icon class="arrow-icon" :size="20"><ArrowRight /></el-icon>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="filteredBusiness.length === 0"
            description="暂无相关业务"
          />
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Clock } from '@element-plus/icons-vue'
import { businessData, businessCategories } from '@/data/businessData'

const router = useRouter()
const selectedCategory = ref('all')

// 筛选后的业务列表
const filteredBusiness = computed(() => {
  if (selectedCategory.value === 'all') {
    return businessData
  }
  return businessData.filter(b => b.category === selectedCategory.value)
})

// 获取分类颜色
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
</script>

<style scoped lang="scss">
.business-list-container {
  width: 100%;
  min-height: 100vh;
  background: $background-color;

  .header {
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    color: white;
    padding: 20px 40px;

    .header-content {
      @include flex-between;
      max-width: 1400px;
      margin: 0 auto;

      .title {
        font-size: 28px;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;

    .category-tabs {
      margin-bottom: 32px;

      :deep(.el-radio-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      :deep(.el-radio-button) {
        .el-radio-button__inner {
          padding: 12px 20px;
          font-size: 16px;
          border-radius: $border-radius-md;

          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }

    .business-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;

      .business-card {
        @include card-style;
        @include flex-between;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-direction: row;
        align-items: center;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
        }

        .business-icon {
          flex-shrink: 0;
          @include flex-center;
          width: 80px;
          height: 80px;
          border-radius: $border-radius-lg;
          background: $background-color;
        }

        .business-info {
          flex: 1;
          margin: 0 20px;
          min-width: 0;

          .business-name {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: $text-primary;
          }

          .business-category {
            font-size: 14px;
            color: $primary-color;
            margin: 0 0 8px 0;
            font-weight: 500;
          }

          .business-desc {
            font-size: 14px;
            color: $text-secondary;
            margin: 0 0 12px 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.5;
          }

          .business-meta {
            @include flex-center;
            gap: 12px;

            .step-count {
              font-size: 12px;
              color: $text-secondary;
            }
          }
        }

        .arrow-icon {
          flex-shrink: 0;
          color: $text-secondary;
        }
      }
    }
  }
}
</style>
