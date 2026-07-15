<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchBoards } from './services/boardService'

const category = ref('전체 카테고리')
const keyword = ref('')
const boards = ref([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const pageSize = 8
const menus = ['전체 게시글', '여행 후기', '질문 & 답변', '여행 팁', '자유 게시판', '공지사항']

const filteredPosts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return boards.value.filter((post) => {
    const categoryMatches = category.value === '전체 카테고리' || post.category === category.value
    const keywordMatches = !query || `${post.title} ${post.author}`.toLowerCase().includes(query)
    return categoryMatches && keywordMatches
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))
const posts = computed(() => filteredPosts.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))

watch([category, keyword], () => { currentPage.value = 1 })

async function loadBoards() {
  loading.value = true
  error.value = ''
  try {
    boards.value = await fetchBoards()
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

onMounted(loadBoards)
</script>

<template>
  <main class="boards-page page-shell">
    <aside class="surface community-sidebar">
      <header><span>♙</span><div><h1>커뮤니티</h1><p>서울 여행의 모든 이야기</p></div></header>
      <nav><button v-for="menu in menus" :key="menu" type="button" :class="{ active: category === menu || (menu === '전체 게시글' && category === '전체 카테고리') }" @click="category = menu === '전체 게시글' ? '전체 카테고리' : menu"><span>◇</span>{{ menu }}</button></nav>
    </aside>
    <section class="surface boards-content">
      <div class="boards-heading"><div><h1>게시판</h1><p>서울 여행에 대한 다양한 이야기를 나눠보세요.</p></div><div class="board-tools"><select v-model="category" aria-label="게시글 카테고리"><option>전체 카테고리</option><option v-for="menu in menus.slice(1)" :key="menu">{{ menu }}</option></select><label><input v-model="keyword" type="search" placeholder="검색어를 입력해주세요" aria-label="게시글 검색"><span>⌕</span></label><RouterLink class="primary-button" to="/boards/write">✎ 글쓰기</RouterLink></div></div>

      <div v-if="loading" class="board-state"><span class="spinner"></span><p>게시글을 불러오는 중입니다.</p></div>
      <div v-else-if="error" class="board-state error-state"><p>{{ error }}</p><button class="outline-button" type="button" @click="loadBoards">다시 불러오기</button></div>
      <template v-else>
        <div class="board-table" role="table" aria-label="게시글 목록">
          <div class="table-head" role="row"><span>제목</span><span>작성자</span><span>작성일</span><span>조회</span></div>
          <RouterLink v-for="post in posts" :key="post.id" :to="`/boards/${post.id}`" class="table-row" role="row"><span><em>{{ post.category }}</em>{{ post.title }}</span><span>◯ {{ post.author }}</span><span>{{ post.date }}</span><span>{{ post.views.toLocaleString() }}</span></RouterLink>
          <div v-if="posts.length === 0" class="empty-posts">조건에 맞는 게시글이 없습니다.</div>
        </div>
        <nav v-if="filteredPosts.length > pageSize" class="board-pagination" aria-label="게시판 페이지"><button type="button" :disabled="currentPage === 1" @click="currentPage--">‹</button><button v-for="page in pageNumbers" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">{{ page }}</button><button type="button" :disabled="currentPage === totalPages" @click="currentPage++">›</button></nav>
      </template>
    </section>
  </main>
</template>

<style scoped>
.boards-page { display: grid; grid-template-columns: 290px 1fr; gap: 24px; }.community-sidebar { min-height: 720px; padding: 34px 28px; }.community-sidebar header { display: flex; align-items: center; gap: 16px; }.community-sidebar header > span { width: 70px; height: 70px; display: grid; place-items: center; border-radius: 50%; color: var(--color-primary); background: var(--color-primary-soft); font-size: 34px; }.community-sidebar h1 { margin: 0; font-size: 25px; }.community-sidebar p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 14px; }.community-sidebar nav { margin-top: 36px; display: grid; gap: 8px; }.community-sidebar nav button { height: 58px; padding: 0 18px; display: flex; align-items: center; gap: 15px; border: 0; border-radius: 9px; background: transparent; cursor: pointer; font-weight: 650; text-align: left; }.community-sidebar nav button.active { color: var(--color-primary-deep); background: var(--color-primary-pale); }.community-sidebar nav span { color: var(--color-primary); }
.boards-content { padding: 38px 30px; min-width: 0; }.boards-heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; }.boards-heading h1 { margin: 0; font-size: 30px; }.boards-heading p { margin: 9px 0 0; color: var(--color-text-secondary); }.board-tools { display: flex; gap: 12px; }.board-tools select, .board-tools label { height: 50px; border: 1px solid var(--color-border); border-radius: 9px; background: white; }.board-tools select { padding: 0 16px; }.board-tools label { min-width: 250px; padding: 0 14px; display: flex; align-items: center; }.board-tools input { width: 100%; border: 0; outline: 0; }
.board-table { margin-top: 34px; overflow: hidden; border: 1px solid var(--color-border); border-radius: 10px; }.table-head, .table-row { min-height: 64px; display: grid; grid-template-columns: minmax(0, 1fr) 180px 130px 90px; align-items: center; }.table-head { background: #faf9ff; text-align: center; }.table-row { border-top: 1px solid var(--color-border-soft); }.table-row:hover { background: #fcfbff; }.table-row > span:first-child { padding-left: 20px; display: flex; align-items: center; gap: 16px; }.table-row > span:not(:first-child) { text-align: center; color: #656779; }.table-row em { min-width: 88px; padding: 5px 8px; border: 1px solid #d8d0ff; border-radius: 5px; color: var(--color-primary); text-align: center; font-size: 12px; font-style: normal; }.empty-posts { padding: 80px 20px; border-top: 1px solid var(--color-border-soft); color: var(--color-text-secondary); text-align: center; }
.board-state { min-height: 420px; display: grid; place-items: center; align-content: center; color: var(--color-text-secondary); }.board-state p { margin: 16px 0; }.error-state { color: #a13f48; }.spinner { width: 30px; height: 30px; border: 3px solid #e6e1fb; border-top-color: var(--color-primary); border-radius: 50%; animation: spin .8s linear infinite; }.board-pagination { margin-top: 26px; display: flex; justify-content: center; gap: 6px; }.board-pagination button { width: 36px; height: 36px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; }.board-pagination button.active { color: white; background: var(--color-primary); }.board-pagination button:disabled { opacity: .35; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1050px) { .boards-page { grid-template-columns: 1fr; }.community-sidebar { min-height: 0; }.community-sidebar nav { grid-template-columns: repeat(3, 1fr); }.boards-heading { align-items: flex-start; flex-direction: column; }.board-tools { width: 100%; flex-wrap: wrap; } }
@media (max-width: 700px) { .community-sidebar nav { grid-template-columns: 1fr 1fr; }.boards-content { padding: 24px 14px; }.board-tools label { min-width: 100%; }.table-head { display: none; }.table-row { padding: 16px; grid-template-columns: 1fr 1fr; gap: 10px; }.table-row > span:first-child { padding: 0; grid-column: 1/-1; align-items: flex-start; flex-direction: column; }.table-row > span:not(:first-child) { text-align: left; }.table-row > span:last-child { display: none; } }
</style>
