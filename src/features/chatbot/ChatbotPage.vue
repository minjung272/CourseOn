<script setup>
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>

<template>
  <main class="chat-page page-shell">
    <aside class="surface chat-intro">
      <span class="intro-icon">✦</span>
      <h1>Course On AI</h1>
      <p>서울의 다양한 여행 코스를<br>등록된 51개 데이터에 근거해 추천해드려요.</p>
      <dl>
        <div><dt>지역으로 찾기</dt><dd>데이터가 등록된 서울 지역</dd></div>
        <div><dt>테마로 찾기</dt><dd>산책, 야경, 역사, 맛집 등</dd></div>
        <div><dt>상황으로 찾기</dt><dd>데이트, 가족, 비 오는 날 등</dd></div>
      </dl>
      <small>API 키는 서버의 .env에서만 사용되며 브라우저에는 노출되지 않습니다.</small>
    </aside>
    <section class="chat-embed surface"><ChatbotWidget embedded /></section>
  </main>
</template>

<style scoped>
.chat-page { height: calc(100vh - var(--header-height)); min-height: 720px; display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 20px; }.chat-intro { padding: 42px 30px; }.intro-icon { width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; color: var(--color-primary); background: var(--color-primary-soft); font-size: 28px; }.chat-intro h1 { margin: 22px 0 10px; }.chat-intro > p { color: var(--color-text-secondary); line-height: 1.7; }.chat-intro dl { margin: 40px 0; }.chat-intro dl div { padding: 18px 0; border-bottom: 1px solid var(--color-border-soft); }.chat-intro dt { color: var(--color-primary); font-weight: 700; }.chat-intro dd { margin: 7px 0 0; color: var(--color-text-secondary); font-size: 13px; }.chat-intro small { color: #9293a2; line-height: 1.6; }.chat-embed { min-width: 0; overflow: hidden; }
@media (max-width: 900px) { .chat-page { height: auto; grid-template-columns: 1fr; }.chat-intro { display: none; }.chat-embed { height: calc(100vh - var(--header-height) - 24px); min-height: 650px; } }
</style>
