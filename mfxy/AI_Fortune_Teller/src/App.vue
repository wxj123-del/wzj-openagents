<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-mystic-dark via-purple-900 to-mystic-dark">
    <Header />
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Layout/Header.vue'
import Footer from './components/Layout/Footer.vue'
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
