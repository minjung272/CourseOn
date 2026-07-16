<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/" aria-label="Course On 홈">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 38" fill="none">
            <path d="M16 37C10.6 31.8 2 23.4 2 14.8C2 6.6 8.3 1 16 1s14 5.6 14 13.8C30 23.4 21.4 31.8 16 37Z" fill="currentColor"/>
            <circle cx="16" cy="14" r="5" fill="white"/>
          </svg>
        </span>
        <span>Course On</span>
      </RouterLink>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="isMenuOpen"
        :aria-label="isMenuOpen ? '메뉴 닫기' : '메뉴 열기'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <nav :class="['main-nav', { 'is-open': isMenuOpen }]" aria-label="주요 메뉴">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" @click="isMenuOpen = false">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <RouterLink class="icon-button" to="/courses" aria-label="코스 검색">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="m16.2 16.2 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </RouterLink>
        <button class="profile-button" type="button" aria-label="내 프로필">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
            <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="mobile-actions">
      <button type="button" aria-label="메뉴 열기" @click="isMenuOpen = !isMenuOpen">☰</button>
      <button type="button" aria-label="내 프로필">♙</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const navItems = [
  { label: '홈', path: '/' },
  { label: '여행코스', path: '/courses' },
  { label: '맞춤추천', path: '/recommend' },
  { label: '지도', path: '/map' },
  { label: '게시판', path: '/boards' },
  { label: '챗봇', path: '/chatbot' },
]
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 76px;
  border-bottom: 1px solid var(--color-border-soft);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
}

.header-inner {
  width: min(calc(100% - 48px), var(--layout-max-width));
  height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  align-items: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  color: var(--color-text);
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.brand-mark {
  width: 32px;
  height: 38px;
  color: var(--color-primary);
  display: inline-flex;
}

.brand-mark svg {
  width: 100%;
  height: 100%;
}

.main-nav {
  height: 100%;
  display: flex;
  justify-content: center;
  gap: clamp(32px, 5vw, 76px);
}

.main-nav a {
  position: relative;
  height: 100%;
  display: inline-flex;
  align-items: center;
  color: #171923;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}

.main-nav a::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 3px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--color-primary);
  transition: width 0.2s ease;
}

.main-nav a:hover,
.main-nav a.router-link-exact-active {
  color: var(--color-primary-deep);
}

.main-nav a.router-link-exact-active::after {
  width: 48px;
}

.main-nav a.router-link-active:not([href='/']) {
  color: var(--color-primary-deep);
}

.main-nav a.router-link-active:not([href='/'])::after { width: 48px; }

.header-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.icon-button,
.profile-button,
.menu-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #263452;
  cursor: pointer;
}

.icon-button {
  width: 30px;
  height: 30px;
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.icon-button svg,
.profile-button svg {
  width: 100%;
  height: 100%;
}

.profile-button svg {
  width: 24px;
  height: 24px;
}

.menu-button {
  display: none;
  width: 38px;
  height: 38px;
  padding: 8px;
}

.menu-button span {
  display: block;
  height: 2px;
  margin: 5px 0;
  border-radius: 999px;
  background: currentColor;
}

.mobile-actions { display: none; }

@media (max-width: 1000px) {
  .header-inner {
    grid-template-columns: 1fr auto auto;
  }

  .brand {
    font-size: 23px;
  }

  .menu-button {
    display: block;
    grid-column: 2;
  }

  .header-actions {
    grid-column: 3;
    gap: 10px;
  }

  .main-nav {
    position: absolute;
    top: 76px;
    left: 0;
    right: 0;
    height: auto;
    padding: 12px 28px 22px;
    display: none;
    flex-direction: column;
    gap: 0;
    border-bottom: 1px solid var(--color-border);
    background: white;
    box-shadow: var(--shadow-md);
  }

  .main-nav.is-open {
    display: flex;
  }

  .main-nav a {
    height: 48px;
  }

  .main-nav a::after {
    display: none;
  }
}

@media (max-width: 600px) {
  .app-header {
    height: 66px;
  }

  .header-inner {
    width: min(100% - 32px, 1608px);
    position: relative;
    display: flex;
    justify-content: space-between;
  }

  .brand-mark {
    width: 25px;
    height: 30px;
  }

  .brand {
    gap: 8px;
    font-size: 20px;
  }

  .main-nav {
    top: 66px;
  }

  .menu-button {
    display: none !important;
  }

  .header-actions {
    display: none;
  }

  .icon-button {
    display: none;
  }

  .mobile-actions {
    position: fixed;
    z-index: 100;
    top: 13px;
    right: 16px;
    display: flex;
    gap: 8px;
  }

  .mobile-actions button {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    cursor: pointer;
    font-size: 19px;
  }
}
</style>
