<template>
  <footer class="app-footer" role="contentinfo">
    <div class="container">
      <div class="footer-left">
        <small>© 2026 Course On. All rights reserved.</small>
      </div>

      <div class="footer-links" aria-hidden="false">
        <!-- 실제 페이지가 없으므로 버튼으로 표시 (임시) -->
        <button type="button" class="footer-link" aria-disabled="true" title="임시">이용약관</button>
        <button type="button" class="footer-link" aria-disabled="true" title="임시">개인정보처리방침</button>
        <button type="button" class="footer-link" aria-disabled="true" title="임시">프로젝트 소개</button>
      </div>
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

.footer-link {
  background: transparent;
  border: 0;
  color: var(--color-text-secondary);
  cursor: not-allowed;
  padding: 6px 8px;
  font-weight: 600;
}
</style>