<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter />
    <ChatbotWidget />
  </div>
</template>

<script setup>
import AppHeader from '../../shared/components/AppHeader.vue'
import AppFooter from './AppFooter.vue'
import ChatbotWidget from '../../features/chatbot/components/ChatbotWidget.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-text);
}

.app-main {
  flex: 1;
  width: 100%;
}
</style>
