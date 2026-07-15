<template>
  <nav class="app-nav" aria-label="Primary">
    <ul>
      <li v-for="item in navigationItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : null"
        >
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
/*import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 네비 데이터는 템플릿에 반복으로 직접 쓰지 않고 배열로 관리
const navigationItems = [
  { label: '홈', to: '/' },
  { label: '여행코스', to: '/courses' },
  { label: '맞춤추천', to: '/recommend' },
  { label: '지도', to: '/map' },
  { label: '게시판', to: '/boards' },
  { label: '챗봇', to: '/chatbot' },
]

// 활성 상태 결정 함수: 상세 경로에서도 상위 메뉴가 활성화되도록 startsWith 사용.
// 루트('/')는 정확히 일치하는 경우만 활성화.
const isActive = (item) => {
  const path = route.path || '/'
  if (item.to === '/') return path === '/'
  return path.startsWith(item.to)
}*/
</script>

<style scoped>
.app-nav ul {
  display: flex;
  gap: 28px;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

.nav-link {
  display: inline-block;
  padding: 6px 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: color .18s ease, border-color .18s ease;
  font-weight: 600;
}

.nav-link:hover,
.nav-link:focus {
  color: var(--color-primary);
  outline: none;
}

.nav-link.is-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
</style>