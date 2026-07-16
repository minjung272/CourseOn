<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { featuredCourses } from '../../shared/data/demoContent'
import { deleteBoard, fetchBoard } from './services/boardService'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const deletePassword = ref('')
const actionError = ref('')
const deleting = ref(false)

const updatedDate = computed(() => post.value?.updatedAt?.slice(0, 10).replaceAll('-', '.') || '')

async function loadPost() {
  loading.value = true
  error.value = ''
  try {
    post.value = await fetchBoard(route.params.id)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

function openDeleteModal() {
  deletePassword.value = ''
  actionError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
}

async function removePost() {
  const password = deletePassword.value.trim()
  if (!password) {
    actionError.value = '비밀번호를 입력해주세요. 공백만 입력할 수 없습니다.'
    return
  }

  deleting.value = true
  actionError.value = ''
  try {
    await deleteBoard(post.value.id, password)
    await router.replace('/boards')
  } catch (requestError) {
    actionError.value = requestError.message
  } finally {
    deleting.value = false
  }
}

onMounted(loadPost)
watch(() => route.params.id, (id, previousId) => { if (id && id !== previousId) loadPost() })
</script>

<template>
  <main class="board-detail page-shell">
    <section v-if="loading" class="surface detail-state"><span class="spinner"></span><p>게시글을 불러오는 중입니다.</p></section>
    <section v-else-if="error" class="surface detail-state error-state"><p>{{ error }}</p><button class="outline-button" type="button" @click="router.push('/boards')">목록으로</button></section>
    <template v-else-if="post">
      <article class="surface post-content">
        <span class="post-category">{{ post.category }}</span>
        <h1>{{ post.title }}</h1>
        <div class="post-meta"><span>◯ {{ post.author }}</span><i></i><span>{{ post.date }}</span><i></i><span>◉ {{ post.views.toLocaleString() }}</span></div>
        <hr>
        <div class="post-body">
          <p>{{ post.content }}</p>
          <img v-if="post.imageUrl" :src="post.imageUrl" :alt="`${post.title} 대표 이미지`">
          <div v-if="post.tags?.length" class="post-tags"><span v-for="tag in post.tags" :key="tag"># {{ tag }}</span></div>
        </div>
      </article>
      <aside>
        <section class="surface summary-card"><h2>게시글 정보</h2><dl><div><dt>카테고리</dt><dd>{{ post.category }}</dd></div><div><dt>작성자</dt><dd>{{ post.author }}</dd></div><div><dt>최근 수정</dt><dd>{{ updatedDate }}</dd></div><div><dt>조회수</dt><dd>{{ post.views.toLocaleString() }}</dd></div></dl></section>
        <section class="surface related-card"><h2>함께 보면 좋은 추천 코스</h2><img :src="featuredCourses[2].imageUrl" alt="남산 야경"><div><strong>남산 야경 데이트 코스</strong><p>서울의 야경을 즐기는 추천 코스</p><RouterLink class="outline-button" :to="`/courses/${featuredCourses[2].id}`">자세히 보기</RouterLink></div></section>
        <section class="surface post-actions"><button class="outline-button" type="button" @click="router.push(`/boards/${post.id}/edit`)">✎ 수정</button><button class="outline-button delete-button" type="button" @click="openDeleteModal">♧ 삭제</button><button class="primary-button" type="button" @click="router.push('/boards')">☷ 목록으로</button></section>
      </aside>
    </template>
  </main>

  <div v-if="showDeleteModal" class="modal-backdrop" role="presentation" @click.self="closeDeleteModal">
    <form class="password-modal surface" role="dialog" aria-modal="true" aria-labelledby="delete-title" @submit.prevent="removePost">
      <span class="modal-icon">♧</span><h2 id="delete-title">게시글을 삭제할까요?</h2><p>작성할 때 설정한 비밀번호를 입력해주세요.<br>삭제된 게시글은 복구할 수 없습니다.</p>
      <label>비밀번호<input v-model="deletePassword" type="password" minlength="4" maxlength="20" required autocomplete="current-password" placeholder="비밀번호 4~20자"></label>
      <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
      <footer><button class="outline-button" type="button" :disabled="deleting" @click="closeDeleteModal">취소</button><button class="danger-button" type="submit" :disabled="deleting">{{ deleting ? '삭제 중...' : '삭제하기' }}</button></footer>
    </form>
  </div>
</template>

<style scoped>
.board-detail { display: grid; grid-template-columns: minmax(0, 1fr) 430px; gap: 20px; }.post-content { min-height: 640px; padding: 42px; }.post-category { padding: 6px 12px; border-radius: 999px; color: var(--color-primary); background: var(--color-primary-pale); font-size: 13px; }.post-content h1 { margin: 20px 0; font-size: 31px; }.post-meta { display: flex; align-items: center; gap: 16px; color: var(--color-text-secondary); }.post-meta i { width: 1px; height: 16px; background: var(--color-border); }.post-content hr { margin: 24px 0; border: 0; border-top: 1px solid var(--color-border); }.post-body { color: #555869; line-height: 1.85; }.post-body > p { min-height: 240px; margin: 0; white-space: pre-line; }.post-body img { width: 100%; max-height: 420px; margin: 30px 0 18px; object-fit: cover; border-radius: 14px; }.post-tags { margin-top: 28px; padding-top: 22px; display: flex; flex-wrap: wrap; gap: 8px; border-top: 1px solid var(--color-border); }.post-tags span { padding: 6px 12px; border-radius: 999px; color: var(--color-primary); background: var(--color-primary-pale); font-size: 13px; }
.board-detail > aside { display: grid; align-content: start; gap: 18px; }.summary-card, .related-card, .post-actions { padding: 28px; }.summary-card h2, .related-card h2 { margin: 0 0 22px; font-size: 19px; }.summary-card dl { margin: 0; }.summary-card dl div { padding: 12px 0; display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--color-border-soft); }.summary-card dl div:last-child { border-bottom: 0; }.summary-card dt { color: #77798a; }.summary-card dd { margin: 0; text-align: right; }.related-card { display: grid; grid-template-columns: 110px 1fr; gap: 14px; }.related-card h2 { grid-column: 1/-1; }.related-card img { width: 110px; height: 100px; object-fit: cover; border-radius: 9px; }.related-card p { color: var(--color-text-secondary); font-size: 13px; }.related-card .outline-button { min-height: 36px; padding: 0 12px; font-size: 12px; }.post-actions { display: grid; gap: 10px; }.post-actions button { width: 100%; }.delete-button { color: #c34d57; border-color: #e3aeb3; }
.detail-state { min-height: 620px; grid-column: 1/-1; display: grid; place-items: center; align-content: center; color: var(--color-text-secondary); }.detail-state p { margin: 16px 0; }.error-state { color: #a13f48; }.spinner { width: 32px; height: 32px; border: 3px solid #e6e1fb; border-top-color: var(--color-primary); border-radius: 50%; animation: spin .8s linear infinite; }
.modal-backdrop { position: fixed; z-index: 1500; inset: 0; padding: 20px; display: grid; place-items: center; background: rgba(25, 20, 48, .48); backdrop-filter: blur(3px); }.password-modal { width: min(440px, 100%); padding: 34px; text-align: center; }.modal-icon { width: 58px; height: 58px; margin: 0 auto; display: grid; place-items: center; border-radius: 50%; color: #bd4b55; background: #fff0f1; font-size: 26px; }.password-modal h2 { margin: 18px 0 8px; }.password-modal > p { color: var(--color-text-secondary); line-height: 1.6; }.password-modal label { margin-top: 22px; display: grid; gap: 8px; text-align: left; font-size: 14px; font-weight: 700; }.password-modal input { height: 48px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 8px; }.password-modal .form-error { margin: 10px 0 0; color: #b43b46; text-align: left; font-size: 13px; }.password-modal footer { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.danger-button { min-height: 46px; border: 0; border-radius: 10px; color: white; background: #c94f59; cursor: pointer; font-weight: 750; }.password-modal button:disabled { opacity: .55; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 950px) { .board-detail { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .post-content { min-height: 0; padding: 26px 18px; }.post-content h1 { font-size: 25px; }.post-meta { flex-wrap: wrap; }.password-modal { padding: 28px 20px; } }
</style>
