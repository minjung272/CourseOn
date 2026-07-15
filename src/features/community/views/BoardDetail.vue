<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const postId = computed(() => Number(route.params.id))

// 우측 요약 카드에 표시할 항목
const summaryItems = computed(() => {
  if (!post.value?.summary) return []

  return [
    { icon: '⏱️', label: '소요시간', value: post.value.summary.duration },
    { icon: '🚌', label: '이동수단', value: post.value.summary.transport },
    { icon: '👥', label: '추천대상', value: post.value.summary.target },
    { icon: '🎯', label: '난이도', value: post.value.summary.difficulty }
  ]
})

// localStorage에서 게시글 조회 및 조회수 증가
function loadPost() {
  const storedPosts = localStorage.getItem('posts')

  if (!storedPosts) {
    post.value = null
    return
  }

  const parsedPosts = JSON.parse(storedPosts)
  const targetPost = parsedPosts.find((item) => Number(item.id) === postId.value)

  if (targetPost) {
    // 페이지 진입 시 조회수 1 증가
    targetPost.views = Number(targetPost.views || 0) + 1
    localStorage.setItem('posts', JSON.stringify(parsedPosts))
    post.value = targetPost
  } else {
    post.value = null
  }
}

function goToEdit() {
  if (post.value) {
    router.push(`/board/edit/${post.value.id}`)
  }
}

function handleDelete() {
  if (!post.value) return

  const confirmed = confirm('정말 삭제하시겠습니까?')
  if (!confirmed) return

  const storedPosts = localStorage.getItem('posts')
  if (!storedPosts) return

  const parsedPosts = JSON.parse(storedPosts).filter(
    (item) => Number(item.id) !== Number(post.value.id)
  )

  localStorage.setItem('posts', JSON.stringify(parsedPosts))
  alert('게시글이 삭제되었습니다.')
  router.push('/board')
}

function goToList() {
  router.push('/board')
}

function goToCourse() {
  if (post.value?.recommendCourse?.id) {
    router.push(`/course/${post.value.recommendCourse.id}`)
  }
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <div class="page-shell">
    <div v-if="post" class="detail-layout">
      <!-- 좌측: 게시글 상세 -->
      <section class="main-card">
        <div class="post-header">
          <div class="badge">{{ post.category }}</div>
          <h1 class="title">{{ post.title }}</h1>

          <div class="meta-row">
            <span>✍️ {{ post.author }}</span>
            <span>📅 {{ post.createdAt }}</span>
            <span>👁️ {{ post.views }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div v-if="post.content" class="content-body">
          {{ post.content }}
        </div>

        <img
          v-if="post.image"
          :src="post.image"
          alt="대표 이미지"
          class="post-image"
        />

        <div v-if="post.extraContent" class="extra-content">
          {{ post.extraContent }}
        </div>

        <div v-if="post.tags && post.tags.length" class="tag-list">
          <span v-for="tag in post.tags" :key="tag" class="tag-badge">
            {{ tag }}
          </span>
        </div>
      </section>

      <!-- 우측: 요약/추천/버튼 -->
      <aside class="side-column">
        <div class="side-card">
          <h3 class="card-title">코스 요약</h3>

          <div class="summary-list">
            <div
              v-for="item in summaryItems"
              :key="item.label"
              class="summary-item"
            >
              <span class="summary-icon">{{ item.icon }}</span>
              <div class="summary-text">
                <span class="summary-label">{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="side-card">
          <h3 class="card-title">이 코스가 포함된 추천 코스</h3>

          <div class="recommend-box">
            <img
              v-if="post.recommendCourse?.thumbnail"
              :src="post.recommendCourse.thumbnail"
              alt="추천 코스 썸네일"
              class="recommend-thumb"
            />

            <div class="recommend-info">
              <h4>{{ post.recommendCourse?.title || '추천 코스' }}</h4>
              <p>{{ post.recommendCourse?.description || '추천 코스 설명이 없습니다.' }}</p>
              <button class="btn btn-outline-primary" @click="goToCourse">
                자세히 보기
              </button>
            </div>
          </div>
        </div>

        <div class="action-area">
          <button class="btn btn-outline-primary" @click="goToEdit">수정</button>
          <button class="btn btn-outline-danger" @click="handleDelete">삭제</button>
          <button class="btn btn-primary" @click="goToList">목록으로</button>
        </div>
      </aside>
    </div>

    <div v-else class="empty-state">
      <p>게시글이 존재하지 않습니다.</p>
    </div>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  background: #f8f9fc;
  color: #2f2f3a;
  font-family: 'Pretendard', 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

button,
input,
select {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  background: #f8f9fc;
  padding: 24px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1.7fr 0.9fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-card,
.side-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.badge,
.tag-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: #efe8ff;
  color: #7c5cfc;
  font-weight: 700;
  font-size: 0.9rem;
}

.title {
  margin: 0;
  font-size: 1.7rem;
  line-height: 1.4;
  color: #1f2430;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #6b7280;
  font-size: 0.95rem;
}

.divider {
  height: 1px;
  background: #e5e7eb;
}

.content-body,
.extra-content {
  white-space: pre-line;
  line-height: 1.8;
  color: #4b5563;
}

.post-image {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  margin: 0 0 16px;
  font-size: 1.1rem;
  color: #1f2430;
}

.summary-list {
  display: grid;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f7;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f5f0ff;
  font-size: 1rem;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.recommend-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
}

.recommend-info h4 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: #1f2430;
}

.recommend-info p {
  margin: 0 0 12px;
  color: #6b7280;
  line-height: 1.6;
}

.action-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 700;
}

.btn-outline-primary {
  border-color: #7c5cfc;
  color: #7c5cfc;
  background: #fff;
}

.btn-outline-danger {
  border-color: #ef4444;
  color: #ef4444;
  background: #fff;
}

.btn-primary {
  background: #7c5cfc;
  color: #fff;
}

.empty-state {
  min-height: 60vh;
  display: grid;
  place-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08));
  color: #6b7280;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .page-shell {
    padding: 16px;
  }
}
</style>