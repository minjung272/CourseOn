<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { featuredCourses } from '../../shared/data/demoContent'

const route = useRoute()
const router = useRouter()
const selected = computed(() => ({
  여행지: '서울', 여행기간: '2일 (1박 2일)', 여행테마: route.query.interest || '감성 · 데이트',
  선호활동: '카페 · 야경 · 산책', 예산: '1인당 10만원대', 동행: route.query.companion || '연인', 이동수단: route.query.transport || '대중교통',
}))
</script>

<template>
  <main class="result-page page-shell">
    <aside class="surface condition-panel">
      <h2>✦ 선택한 조건</h2>
      <dl><div v-for="(value, label) in selected" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></dl>
      <button class="outline-button" type="button" @click="router.push('/recommend')">✎ 조건 수정하기</button>
    </aside>
    <section class="surface result-panel">
      <header><h1>✦ 추천 코스 TOP 3</h1><RouterLink to="/courses">전체 코스 보기 ›</RouterLink></header>
      <div class="top-grid">
        <article v-for="(course, index) in featuredCourses.slice(0, 3)" :key="course.id" class="result-card">
          <div class="result-image"><img :src="course.imageUrl" :alt="course.imageAlt"><b>{{ index + 1 }}</b></div>
          <div class="result-body"><h2>{{ course.title }}</h2><p>{{ course.description }}</p><small>▣ 1박 2일　▤ {{ course.transport }}　▥ 난이도 쉬움</small><div><span v-for="tag in course.tags" :key="tag" class="tag-chip">#{{ tag }}</span></div><RouterLink class="outline-button" :to="`/courses/${course.id}`">상세보기 →</RouterLink></div>
        </article>
      </div>
      <div class="more-section"><h2>이런 코스는 어때요?</h2><div class="mini-grid"><article v-for="course in featuredCourses" :key="course.id"><img :src="course.imageUrl" :alt="course.imageAlt"><div><strong>{{ course.title }}</strong><p>{{ course.description }}</p><RouterLink :to="`/courses/${course.id}`">→</RouterLink></div></article></div></div>
    </section>
  </main>
</template>

<style scoped>
.result-page { display: grid; grid-template-columns: 310px 1fr; gap: 24px; }
.condition-panel { padding: 28px; align-self: start; position: sticky; top: 100px; }
.condition-panel h2 { margin: 0 0 26px; }
.condition-panel dl { margin: 0; }
.condition-panel dl div { padding: 15px 0; border-bottom: 1px solid var(--color-border-soft); }
.condition-panel dt { color: var(--color-primary); font-size: 13px; }
.condition-panel dd { margin: 5px 0 0; font-weight: 650; }
.condition-panel .outline-button { width: 100%; margin-top: 24px; }
.result-panel { padding: 28px; min-width: 0; }
.result-panel > header { display: flex; justify-content: space-between; align-items: center; }
.result-panel > header h1 { margin: 0; font-size: 23px; }
.result-panel > header a { color: var(--color-primary); font-weight: 700; }
.top-grid { margin-top: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.result-card { overflow: hidden; border: 1px solid var(--color-border); border-radius: 14px; }
.result-image { height: 190px; position: relative; }
.result-image img { width: 100%; height: 100%; object-fit: cover; }
.result-image b { position: absolute; top: 14px; left: 14px; width: 38px; height: 38px; display: grid; place-items: center; border: 2px solid white; border-radius: 50%; color: white; background: var(--color-primary); }
.result-body { padding: 20px; }
.result-body h2 { margin: 0; font-size: 20px; }
.result-body p { min-height: 42px; color: var(--color-text-secondary); font-size: 14px; }
.result-body small { color: #717487; }
.result-body > div { margin: 16px 0; display: flex; flex-wrap: wrap; gap: 7px; }
.result-body .outline-button { min-height: 40px; float: right; }
.more-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-border); }
.more-section h2 { font-size: 19px; }
.mini-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.mini-grid article { padding: 10px; display: grid; grid-template-columns: 86px 1fr; gap: 10px; border: 1px solid var(--color-border); border-radius: 11px; }
.mini-grid img { width: 86px; height: 86px; object-fit: cover; border-radius: 8px; }
.mini-grid strong { font-size: 13px; }.mini-grid p { margin: 6px 0; color: var(--color-text-secondary); font-size: 11px; }.mini-grid a { color: var(--color-primary); }
@media (max-width: 1100px) { .result-page { grid-template-columns: 1fr; } .condition-panel { position: static; } .top-grid { grid-template-columns: 1fr 1fr; } .mini-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 650px) { .top-grid, .mini-grid { grid-template-columns: 1fr; } .result-panel { padding: 18px; } }
</style>
