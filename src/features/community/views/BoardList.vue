<script setup>
import { computed, ref } from 'vue'

const categories = ['전체 카테고리', '여행 후기', '질문 & 답변', '여행 팁', '자유 게시판', '공지사항']

const posts = ref([
  { id: 1, category: '여행 후기', title: '서울 2박 3일 혼자 여행 다녀왔어요! 코스 공유합니다 😊', author: '여행좋아', date: '2024.05.21', views: 523 },
  { id: 2, category: '질문 & 답변', title: '부산 여행 중 맛집 추천 부탁드려요.', author: '여행초보', date: '2024.05.20', views: 312 },
  { id: 3, category: '여행 팁', title: '여행 가방 짐싸는 꿀팁 5가지 공유합니다.', author: '가방마스터', date: '2024.05.19', views: 481 },
  { id: 4, category: '자유 게시판', title: '다음 주말 제주도 가려고 하는데 동행 구해요!', author: '제주러버', date: '2024.05.18', views: 287 },
  { id: 5, category: '공지사항', title: 'CourseOn 커뮤니티 이용 규정 안내드립니다.', author: '운영자', date: '2024.05.17', views: 654 },
  { id: 6, category: '여행 후기', title: '강릉 감성 여행 코스 추천해요.', author: '바다사람', date: '2024.05.16', views: 420 },
  { id: 7, category: '질문 & 답변', title: '1인 여행 시 안전하게 이동하는 팁이 있을까요?', author: '안전중시', date: '2024.05.15', views: 238 },
  { id: 8, category: '여행 팁', title: '교통카드 없이도 편하게 이동하는 방법', author: '여행준비', date: '2024.05.14', views: 355 },
  { id: 9, category: '자유 게시판', title: '벚꽃 시즌에 다녀온 충주 여행 이야기', author: '봄여행', date: '2024.05.13', views: 199 },
  { id: 10, category: '여행 후기', title: '전주 한옥마을에서 느낀 감성 여행 기록', author: '한옥좋아', date: '2024.05.12', views: 445 }
])

const selectedCategory = ref('전체 카테고리')
const searchKeyword = ref('')
const activeMenu = ref('전체 게시글')
const currentPage = ref(1)

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const matchesCategory = selectedCategory.value === '전체 카테고리' || post.category === selectedCategory.value
    const keyword = searchKeyword.value.trim().toLowerCase()
    const matchesKeyword = !keyword || post.title.toLowerCase().includes(keyword) || post.author.toLowerCase().includes(keyword)
    return matchesCategory && matchesKeyword
  })
})

function handleWrite() {
  console.log('글쓰기 클릭')
}

function handleDetail(postId) {
  console.log('상세 보기', postId)
}

function selectMenu(menu) {
  activeMenu.value = menu
}
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <div class="brand-wrap">
        <div class="brand-icon">📍</div>
        <span class="brand-name">Course On</span>
      </div>

      <nav class="topnav">
        <a href="#">홈</a>
        <a href="#">여행코스</a>
        <a href="#">맞춤추천</a>
        <a href="#">지도</a>
        <a href="#" class="active">게시판</a>
      </nav>

      <div class="topbar-actions">
        <button class="icon-btn" aria-label="search">🔎</button>
        <button class="icon-btn" aria-label="profile">👤</button>
      </div>
    </header>

    <main class="main-content">
      <aside class="sidebar-card">
        <div class="sidebar-header">
          <div class="avatar">✈</div>
          <div>
            <h3>커뮤니티</h3>
            <p>여행의 모든 이야기를 나누세요</p>
          </div>
        </div>

        <ul class="menu-list">
          <li v-for="menu in ['전체 게시글', '여행 후기', '질문 & 답변', '여행 팁', '자유 게시판', '공지사항']" :key="menu" @click="selectMenu(menu)" :class="{ active: activeMenu === menu }">
            <span class="menu-icon">•</span>
            <span>{{ menu }}</span>
          </li>
        </ul>
      </aside>

      <section class="board-card">
        <div class="board-header">
          <div>
            <h2>게시판</h2>
            <p>여행에 대한 다양한 이야기를 나눠보세요.</p>
          </div>

          <div class="board-actions">
            <select v-model="selectedCategory" class="category-select">
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>

            <label class="search-box">
              <span>🔎</span>
              <input v-model="searchKeyword" type="text" placeholder="검색어를 입력해주세요" />
            </label>

            <button class="write-btn" @click="handleWrite">
              <span>✏️</span>
              글쓰기
            </button>
          </div>
        </div>

        <div class="board-summary">
          <span>총 {{ filteredPosts.length }}개의 게시글</span>
        </div>

        <div v-if="filteredPosts.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in filteredPosts" :key="post.id">
                <td>
                  <span class="badge">{{ post.category }}</span>
                </td>
                <td>
                  <button class="title-link" @click="handleDetail(post.id)">{{ post.title }}</button>
                </td>
                <td>
                  <span class="author-cell">👤 {{ post.author }}</span>
                </td>
                <td>{{ post.date }}</td>
                <td>{{ post.views }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <p>검색 결과가 없습니다.</p>
        </div>

        <div class="pagination">
          <button class="page-btn">〈</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn">4</button>
          <button class="page-btn">5</button>
          <button class="page-btn">〉</button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Pretendard', 'Segoe UI', sans-serif;
  background: #f8f9fc;
  color: #2f2f3a;
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
  padding: 24px 32px 40px;
}

.topbar {
  max-width: 1400px;
  margin: 0 auto 24px;
  background: #ffffff;
  border: 1px solid #ececf4;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.15rem;
  color: #2f2f3a;
}

.brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #7c5cfc, #9a80ff);
  color: white;
}

.topnav {
  display: flex;
  gap: 24px;
}

.topnav a {
  text-decoration: none;
  color: #6b7280;
  font-weight: 600;
  transition: color 0.2s ease;
}

.topnav a.active,
.topnav a:hover {
  color: #7c5cfc;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ececf4;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.sidebar-card,
.board-card {
  background: #ffffff;
  border: 1px solid #ececf4;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.sidebar-card {
  padding: 24px 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0f1f7;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c5cfc, #a98fff);
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.25rem;
}

.sidebar-header h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.sidebar-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #8b8fa3;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  color: #5d6276;
  transition: all 0.2s ease;
}

.menu-list li:hover {
  background: #f5f2ff;
  color: #7c5cfc;
}

.menu-list li.active {
  background: #efe9ff;
  color: #7c5cfc;
  font-weight: 700;
}

.menu-icon {
  font-size: 0.8rem;
}

.board-card {
  padding: 24px 28px 28px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.board-header h2 {
  margin: 0 0 6px;
  font-size: 1.35rem;
}

.board-header p {
  margin: 0;
  color: #7f8597;
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-select,
.search-box {
  border: 1px solid #e7e8ef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
}

.category-select {
  min-width: 160px;
  color: #3c4152;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 260px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
}

.write-btn {
  background: #7c5cfc;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-weight: 700;
}

.board-summary {
  margin-bottom: 14px;
  color: #6c7284;
  font-weight: 600;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #ececf4;
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f2f3f8;
}

th {
  background: #fafbff;
  color: #6d7282;
  font-size: 0.9rem;
}

tbody tr {
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: #f8f5ff;
}

.badge {
  display: inline-block;
  padding: 6px 10px;
  background: #efe9ff;
  color: #7c5cfc;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.title-link {
  background: none;
  border: none;
  padding: 0;
  color: #2f2f3a;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: color 0.2s ease;
}

.title-link:hover {
  color: #7c5cfc;
}

.author-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #5d6276;
}

.empty-state {
  padding: 48px 16px;
  text-align: center;
  color: #8a90a4;
  border: 1px dashed #e8eaf2;
  border-radius: 12px;
  margin-top: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  width: 38px;
  height: 38px;
  border: 1px solid #e6e7ef;
  border-radius: 10px;
  background: #fff;
  color: #5d6276;
  cursor: pointer;
}

.page-btn.active {
  background: #7c5cfc;
  color: white;
  border-color: #7c5cfc;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar-card {
    order: 2;
  }
}

@media (max-width: 768px) {
  .page-shell {
    padding: 16px;
  }

  .topbar,
  .board-header {
    flex-direction: column;
    align-items: stretch;
  }

  .topnav {
    flex-wrap: wrap;
    gap: 12px;
  }

  .board-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box,
  .category-select {
    min-width: auto;
  }
}
</style>
