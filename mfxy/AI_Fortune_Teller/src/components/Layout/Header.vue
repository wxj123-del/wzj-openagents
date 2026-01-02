<template>
  <header class="mystic-card border-b-2 border-mystic-purple/50">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h1 class="mystic-title text-2xl md:text-3xl">✨ AI占卜师</h1>
      </div>

      <nav class="hidden md:flex space-x-6">
        <router-link to="/" class="text-gray-200 hover:text-mystic-gold transition-colors">首页</router-link>
        <router-link to="/tarot" class="text-gray-200 hover:text-mystic-gold transition-colors">塔罗占卜</router-link>
        <router-link to="/horoscope" class="text-gray-200 hover:text-mystic-gold transition-colors">星座运势</router-link>
        <router-link to="/history" class="text-gray-200 hover:text-mystic-gold transition-colors">历史记录</router-link>
        <router-link to="/profile" class="text-gray-200 hover:text-mystic-gold transition-colors">设置</router-link>
      </nav>

      <div class="flex items-center space-x-4">
        <!-- 连接状态指示器 -->
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :class="avatarStore.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'"
          ></div>
          <span class="text-sm text-gray-300">
            {{ avatarStore.isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div class="md:hidden mt-4 flex flex-wrap gap-2">
      <router-link to="/" class="px-3 py-1 text-sm bg-mystic-purple/30 rounded-lg hover:bg-mystic-purple/50">首页</router-link>
      <router-link to="/tarot" class="px-3 py-1 text-sm bg-mystic-purple/30 rounded-lg hover:bg-mystic-purple/50">塔罗</router-link>
      <router-link to="/horoscope" class="px-3 py-1 text-sm bg-mystic-purple/30 rounded-lg hover:bg-mystic-purple/50">星座</router-link>
      <router-link to="/history" class="px-3 py-1 text-sm bg-mystic-purple/30 rounded-lg hover:bg-mystic-purple/50">历史</router-link>
      <router-link to="/profile" class="px-3 py-1 text-sm bg-mystic-purple/30 rounded-lg hover:bg-mystic-purple/50">设置</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAvatarStore } from '@/stores/avatar'

const avatarStore = useAvatarStore()
</script>
