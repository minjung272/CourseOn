<template>
  <header class="app-header" role="banner">
    <div class="container">
      <RouterLink to="/" class="logo" aria-label="Course On 홈으로 이동">
        <span class="logo-icon" aria-hidden="true">
          <!-- 간단한 위치 핀 / 하트 형태 SVG -->
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.243 2 7 4.243 7 7c0 4.5 5 10.5 5 10.5s5-6 5-10.5c0-2.757-2.243-5-5-5z" fill="var(--color-primary)"/>
            <circle cx="12" cy="7" r="2.2" fill="#fff"/>
          </svg>
        </span>
        <span class="logo-text">Course On</span>
      </RouterLink>

      <AppNavigation />

      <div class="header-actions" aria-hidden="false">
        <button type="button" class="icon-btn" aria-label="검색" @click="onSearch">
          <!-- 검색 아이콘 -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button type="button" class="icon-btn" aria-label="사용자 메뉴" @click="onUser">
          <!-- 사용자 아이콘 -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import AppNavigation from './AppNavigation.vue'
/*import { RouterLink } from 'vue-router'

const onSearch = () => {
  // TODO: 검색 모달/페이지 구현 예정
  // 현재는 임시 동작(콘솔 로그)
  console.log('검색 버튼 클릭 - TODO: 검색 동작 구현')
}

const onUser = () => {
  // TODO: 사용자 메뉴 구현 예정
  console.log('사용자 버튼 클릭 - TODO: 로그인/프로필 동작 구현')
}*/
</script>

<style scoped>
.app-header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  display: flex;
  align-items: center;
}

.container {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: space-between;
}

.logo {
  display: flex;
  gap: 10px;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
}

.logo-icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary-light);
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-weight: 700;
  color: var(--color-text);
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background .12s ease, color .12s ease, transform .06s ease;
}

.icon-btn:hover,
.icon-btn:focus {
  color: var(--color-primary);
  background: var(--color-primary-light);
  outline: none;
  transform: translateY(-1px);
}
</style>