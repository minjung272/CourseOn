<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ embedded: { type: Boolean, default: false } })
const route = useRoute()
const isOpen = ref(false)
const input = ref('')
const loading = ref(false)
const messagesEl = ref(null)
const suggestions = ['강서구 산책 코스 추천해줘', '강동구 야경 코스 알려줘', '비 오는 날 실내 코스 알려줘', '아이와 가기 좋은 코스 추천해줘']
const messages = ref([
  { role: 'assistant', content: '안녕하세요! Course On AI 여행 도우미예요. 😊\n서울의 지역이나 원하는 테마를 말씀해주세요.' },
])

const shouldRender = computed(() => props.embedded || route.name !== 'Chatbot')
const panelVisible = computed(() => props.embedded || isOpen.value)

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function friendlyError(code, fallback) {
  const messagesByCode = {
    CONFIGURATION_ERROR: '.env 파일에 OPENAI_API_KEY를 입력하고 개발 서버를 다시 실행해주세요.',
    AUTH_ERROR: 'API 키가 올바르지 않습니다. .env의 OPENAI_API_KEY를 확인해주세요.',
    MODEL_ACCESS_ERROR: '현재 API 프로젝트에서 이 모델을 사용할 수 없습니다. .env의 OPENAI_MODEL을 확인해주세요.',
    QUOTA_EXCEEDED: 'OpenAI API 사용량 또는 결제 한도를 초과했습니다. 한도를 확인한 뒤 다시 시도해주세요.',
    RATE_LIMIT: '요청이 잠시 몰렸어요. 잠깐 기다렸다가 다시 질문해주세요.',
    OPENAI_UNAVAILABLE: 'AI 서비스가 잠시 응답하지 않아요. 잠시 후 다시 시도해주세요.',
  }
  return messagesByCode[code] || fallback || '답변을 불러오지 못했습니다. 다시 시도해주세요.'
}

async function send(message = input.value) {
  const content = message.trim()
  if (!content || loading.value) return

  const history = messages.value
    .filter((item) => !item.error)
    .slice(-8)
    .map((item) => ({ role: item.role, content: item.content }))

  messages.value.push({ role: 'user', content })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, history }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) throw Object.assign(new Error(payload.message), { code: payload.code })
    messages.value.push({ role: 'assistant', content: payload.answer, courses: payload.courses || [] })
  } catch (error) {
    messages.value.push({ role: 'assistant', content: friendlyError(error.code, error.message), error: true })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>

<template>
  <div v-if="shouldRender" :class="['chatbot-widget', { embedded }]">
    <button v-if="!embedded && !isOpen" class="chatbot-launcher" type="button" aria-label="AI 여행 챗봇 열기" @click="isOpen = true">
      <span>✦</span><b>AI 여행 도우미</b>
    </button>

    <Transition name="chat-pop">
      <section v-if="panelVisible" class="chatbot-panel" aria-label="Course On AI 챗봇">
        <header>
          <span class="bot-avatar">✦</span>
          <div><strong>Course On AI</strong><small><i></i> 서울 여행 도우미</small></div>
          <button v-if="!embedded" type="button" aria-label="챗봇 닫기" @click="isOpen = false">×</button>
        </header>

        <div class="suggestion-strip">
          <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="loading" @click="send(suggestion)">{{ suggestion }}</button>
        </div>

        <div ref="messagesEl" class="chatbot-messages" aria-live="polite">
          <article v-for="(message, index) in messages" :key="index" :class="['chat-message', message.role, { error: message.error }]">
            <span v-if="message.role === 'assistant'" class="mini-avatar">✦</span>
            <div class="message-body">
              <p>{{ message.content }}</p>
              <div v-if="message.courses?.length" class="result-courses">
                <RouterLink v-for="course in message.courses" :key="course.id" :to="`/courses/${course.id}`">
                  <img v-if="course.imageUrl" :src="course.imageUrl" :alt="course.title">
                  <span class="course-placeholder" v-else>서울</span>
                  <span><strong>{{ course.title }}</strong><small>{{ course.district }} · {{ course.tags?.slice(0, 3).join(' · ') }}</small></span>
                  <b>›</b>
                </RouterLink>
              </div>
            </div>
          </article>
          <article v-if="loading" class="chat-message assistant loading-message">
            <span class="mini-avatar">✦</span><p><i></i><i></i><i></i><span class="sr-only">답변을 만드는 중</span></p>
          </article>
        </div>

        <form @submit.prevent="send()">
          <input v-model="input" :disabled="loading" maxlength="500" aria-label="챗봇 질문" placeholder="예: 강서구에서 산책하기 좋은 곳은?">
          <button type="submit" :disabled="loading || !input.trim()" aria-label="메시지 보내기">➤</button>
        </form>
        <p class="chat-notice">AI 답변은 참고용이며 운영시간 등은 공식 정보를 확인해주세요.</p>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.chatbot-widget { position: fixed; z-index: 1200; right: 28px; bottom: 28px; }.chatbot-launcher { height: 58px; padding: 0 20px; display: flex; align-items: center; gap: 10px; border: 0; border-radius: 999px; color: white; background: linear-gradient(135deg, #8064ff, #6040dc); box-shadow: 0 14px 35px rgba(89, 62, 203, .32); cursor: pointer; }.chatbot-launcher span { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: rgba(255,255,255,.18); font-size: 20px; }.chatbot-launcher b { font-size: 14px; }
.chatbot-panel { width: min(410px, calc(100vw - 28px)); height: min(650px, calc(100vh - 110px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #ddd7f8; border-radius: 20px; background: #fff; box-shadow: 0 20px 55px rgba(48, 34, 102, .25); }.chatbot-panel > header { min-height: 76px; padding: 13px 16px; display: flex; align-items: center; gap: 11px; color: white; background: linear-gradient(135deg, #7e61f5, #6545dc); }.bot-avatar, .mini-avatar { flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; }.bot-avatar { width: 44px; height: 44px; background: rgba(255,255,255,.18); font-size: 22px; }.chatbot-panel header div { flex: 1; }.chatbot-panel header strong, .chatbot-panel header small { display: block; }.chatbot-panel header small { margin-top: 4px; color: #eeeaff; font-size: 11px; }.chatbot-panel header small i { width: 7px; height: 7px; margin-right: 5px; display: inline-block; border-radius: 50%; background: #72eda2; }.chatbot-panel header > button { border: 0; color: white; background: transparent; cursor: pointer; font-size: 27px; }
.suggestion-strip { padding: 10px 12px; display: flex; gap: 7px; overflow-x: auto; border-bottom: 1px solid var(--color-border-soft); scrollbar-width: none; }.suggestion-strip button { flex: 0 0 auto; padding: 7px 10px; border: 1px solid #d7cffc; border-radius: 999px; color: #6652b5; background: #faf9ff; cursor: pointer; font-size: 11px; }.suggestion-strip button:disabled { opacity: .55; }
.chatbot-messages { flex: 1; padding: 16px 14px; overflow-y: auto; background: #fafaff; }.chat-message { margin-bottom: 15px; display: flex; align-items: flex-start; gap: 8px; }.chat-message.user { justify-content: flex-end; }.mini-avatar { width: 30px; height: 30px; color: var(--color-primary); background: var(--color-primary-soft); font-size: 13px; }.message-body { max-width: 86%; }.chat-message p { width: fit-content; margin: 0; padding: 10px 12px; border: 1px solid #e5e1f5; border-radius: 4px 14px 14px; background: white; white-space: pre-line; line-height: 1.55; font-size: 13px; }.chat-message.user p { border: 0; border-radius: 14px 4px 14px 14px; color: #2d2850; background: #eae4ff; }.chat-message.error p { color: #a33a42; border-color: #f0c9cc; background: #fff5f5; }
.result-courses { margin-top: 7px; display: grid; gap: 6px; }.result-courses a { min-height: 68px; padding: 7px; display: grid; grid-template-columns: 76px 1fr auto; align-items: center; gap: 9px; border: 1px solid #e2ddf8; border-radius: 10px; color: inherit; background: white; }.result-courses img, .course-placeholder { width: 76px; height: 54px; object-fit: cover; border-radius: 7px; }.course-placeholder { display: grid; place-items: center; color: #7560d9; background: var(--color-primary-pale); font-size: 11px; }.result-courses strong { display: block; font-size: 12px; }.result-courses small { margin-top: 5px; display: block; color: var(--color-text-secondary); font-size: 10px; }.result-courses b { color: var(--color-primary); font-size: 18px; }
.loading-message > p { display: flex; gap: 4px; }.loading-message i { width: 6px; height: 6px; border-radius: 50%; background: #8a74e7; animation: typing 1s infinite ease-in-out; }.loading-message i:nth-child(2) { animation-delay: .15s; }.loading-message i:nth-child(3) { animation-delay: .3s; }
.chatbot-panel > form { min-height: 62px; margin: 10px 12px 0; padding: 6px 7px 6px 14px; display: flex; gap: 8px; border: 1px solid #b9a9ff; border-radius: 14px; }.chatbot-panel > form input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 13px; }.chatbot-panel > form button { width: 46px; border: 0; border-radius: 10px; color: white; background: linear-gradient(135deg, #8064ff, #6543df); cursor: pointer; }.chatbot-panel > form button:disabled { opacity: .45; cursor: not-allowed; }.chat-notice { margin: 7px 12px 10px; color: #9694a4; text-align: center; font-size: 9px; }
.embedded.chatbot-widget { position: static; width: 100%; height: 100%; }.embedded .chatbot-panel { width: 100%; height: 100%; max-height: none; border-radius: 16px; box-shadow: none; }.embedded .chatbot-messages { padding: 28px; }.embedded .message-body { max-width: min(80%, 820px); }.embedded .chatbot-panel > form { margin-inline: 28px; }.chat-pop-enter-active, .chat-pop-leave-active { transition: opacity .2s, transform .2s; }.chat-pop-enter-from, .chat-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.97); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }.chatbot-panel a { text-decoration: none; }
@keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }
@media (max-width: 600px) { .chatbot-widget { right: 14px; bottom: 14px; }.chatbot-panel { height: calc(100vh - 90px); }.chatbot-launcher b { display: none; }.embedded .chatbot-messages { padding: 16px 10px; }.embedded .chatbot-panel > form { margin-inline: 10px; } }
</style>
