<template>
  <section class="stats-panel" aria-labelledby="stats-title">
    <h2 id="stats-title">서울 여행 한눈에 보기</h2>
    <div class="stats-grid">
      <article v-for="stat in stats" :key="stat.label" class="stat-item">
        <span class="stat-icon" aria-hidden="true">{{ stat.icon }}</span>
        <strong>{{ stat.value }}</strong>
        <small>{{ stat.label }}</small>
      </article>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { icon: '⚑', value: '51개', label: '등록 여행코스' },
  { icon: '⌖', value: '15개', label: '등록 지역' },
  { icon: '#', value: '9개', label: '테마 태그' },
  { icon: '◎', value: '51개', label: '지도 좌표' },
]
</script>

<style scoped>
.stats-panel {
  padding: 18px 20px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

h2 {
  margin: 0 0 18px;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.stat-item {
  min-height: 102px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--color-border-soft);
  text-align: center;
}

.stat-item:last-child {
  border-right: 0;
}

.stat-icon {
  min-width: 40px;
  height: 40px;
  padding: 0 10px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  font-size: 18px;
  font-weight: 800;
}

.stat-item strong {
  margin-top: 10px;
  font-size: 19px;
  line-height: 1;
}

.stat-item small {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

@media (max-width: 650px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 0;
  }

  .stat-item:nth-child(2) {
    border-right: 0;
  }
}
</style>
