<template>
  <section class="info-panel map-panel" aria-labelledby="map-title">
    <div class="panel-heading">
      <h2 id="map-title">서울 추천 지도</h2>
      <RouterLink to="/map">지도에서 더보기 <span aria-hidden="true">↗</span></RouterLink>
    </div>
    <RouterLink class="map-link" to="/map" aria-label="서울 추천 지도 보기">
      <img src="../../../assets/images/hero-seoul.jpg" alt="서울 추천 지도 임시 이미지" />
    </RouterLink>
  </section>
</template>

<style scoped>
.info-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
}

.map-panel {
  padding: 14px;
}

.panel-heading {
  min-height: 34px;
  padding: 0 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

h2 {
  margin: 0;
  font-size: 16px;
}

.panel-heading a {
  padding: 8px 12px;
  border: 1px solid #d9d3ff;
  border-radius: 8px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
}

.map-link {
  display: block;
  height: 120px;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: 10px;
}

.map-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
