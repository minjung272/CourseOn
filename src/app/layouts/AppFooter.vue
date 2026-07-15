<template>
  <footer class="app-footer" role="contentinfo">
    <div class="container">
      <small>© 2026 Course On. 서울 여행의 새로운 시작.</small>
      <div class="footer-links"><a href="#">이용약관</a><a href="#">개인정보처리방침</a><a href="#">프로젝트 소개</a></div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
  padding: 20px 0;
}

.container {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links { display: flex; gap: 18px; }
.footer-links a {
  color: var(--color-text-secondary);
  padding: 6px 8px;
  font-weight: 600;
  font-size: 13px;
}

@media (max-width: 640px) { .container { flex-direction: column; gap: 12px; } }
</style>
