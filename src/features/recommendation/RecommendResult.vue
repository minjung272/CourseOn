<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCourses } from '../courses/services/courseService'
import {
  buildConditionQuery,
  clearRecommendationConditions,
  getConditionSummary,
  loadRecommendationConditions,
  parseConditions,
  rankCourses,
  saveRecommendationConditions,
} from './services/recommendationService'

const route = useRoute()
const router = useRouter()
const courses = ref([])
const loading = ref(true)
const errorMessage = ref('')

const conditions = computed(() => {
  const hasQueryConditions = Object.keys(buildConditionQuery(parseConditions(route.query))).length > 0
  return hasQueryConditions
    ? parseConditions(route.query)
    : loadRecommendationConditions() ?? parseConditions(route.query)
})
const selected = computed(() => Object.fromEntries(
  getConditionSummary(conditions.value).map(({ label, value }) => [label, value]),
))
const recommendation = computed(() => rankCourses(courses.value, conditions.value))
const topCourses = computed(() => recommendation.value.courses.slice(0, 3))
const additionalCourses = computed(() => recommendation.value.courses.slice(3, 7))

onMounted(async () => {
  saveRecommendationConditions(conditions.value)

  try {
    const loadedCourses = await fetchCourses()
    courses.value = loadedCourses.filter((course) => !String(course.id).startsWith('demo-'))
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : '추천 코스를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function editConditions() {
  clearRecommendationConditions()
  router.push({ name: 'Recommend', query: buildConditionQuery(conditions.value) })
}

function goToCourseDetail(course) {
  router.push({ name: 'CourseDetail', params: { courseId: course.id } })
}
</script>

<template>
  <main class="result-page page-shell">
    <aside class="surface condition-panel">
      <h2>✦ 선택한 조건</h2>
      <dl><div v-for="(value, label) in selected" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></dl>
      <button class="outline-button" type="button" @click="editConditions">✎ 조건 수정하기</button>
    </aside>
    <section class="surface result-panel">
      <header><h1>✦ 추천 코스 TOP 3</h1><RouterLink to="/courses">전체 코스 보기 ›</RouterLink></header>
      <p v-if="loading" class="status-message">추천 코스를 계산하고 있습니다.</p>
      <p v-else-if="errorMessage" class="status-message error">{{ errorMessage }}</p>
      <template v-else>
        <p v-if="recommendation.isFallback" class="fallback-notice">
          조건과 일치하는 태그가 없어 전체 코스를 기본 순서대로 보여드려요.
        </p>
        <div class="top-grid">
          <article
            v-for="(course, index) in topCourses"
            :key="course.id"
            class="result-card"
            role="link"
            tabindex="0"
            :aria-label="`${course.title} 상세보기`"
            @click="goToCourseDetail(course)"
            @keydown.enter="goToCourseDetail(course)"
          >
            <div class="result-image">
              <img v-if="course.imageUrl" :src="course.imageUrl" :alt="`${course.title} 대표 이미지`">
              <div v-else class="result-placeholder">이미지 준비 중</div>
              <b>{{ index + 1 }}</b>
            </div>
            <div class="result-body">
              <h2>{{ course.title }}</h2>
              <p>{{ course.description }}</p>
              <small>
                추천 점수 {{ course.recommendation.score }}점
                <template v-if="course.recommendation.matchedTags.length">
                  · {{ course.recommendation.matchedTags.join(' · ') }} 일치
                </template>
              </small>
              <div><span v-for="tag in course.tags" :key="tag" class="tag-chip">#{{ tag }}</span></div>
              <span class="outline-button detail-link">상세보기 →</span>
            </div>
          </article>
        </div>
        <div v-if="additionalCourses.length" class="more-section">
          <h2>이런 코스는 어때요?</h2>
          <div class="mini-grid">
            <article
              v-for="course in additionalCourses"
              :key="course.id"
              role="link"
              tabindex="0"
              :aria-label="`${course.title} 상세보기`"
              @click="goToCourseDetail(course)"
              @keydown.enter="goToCourseDetail(course)"
            >
              <img v-if="course.imageUrl" :src="course.imageUrl" :alt="`${course.title} 대표 이미지`">
              <div v-else class="mini-placeholder">이미지 준비 중</div>
              <div><strong>{{ course.title }}</strong><p>추천 점수 {{ course.recommendation.score }}점</p><span class="mini-detail-link">→</span></div>
            </article>
          </div>
        </div>
      </template>
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
.result-card { overflow: hidden; border: 1px solid var(--color-border); border-radius: 14px; cursor: pointer; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.result-card:hover { border-color: var(--color-primary); box-shadow: 0 8px 22px rgba(92, 66, 196, .12); transform: translateY(-2px); }
.result-card:focus-visible, .mini-grid article:focus-visible { outline: 3px solid rgba(117, 89, 237, .35); outline-offset: 3px; }
.result-image { height: 190px; position: relative; }
.result-image img { width: 100%; height: 100%; object-fit: cover; }
.result-placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: #817a9a; background: linear-gradient(135deg, #eeeaff, #f7f6fb); }
.result-image b { position: absolute; top: 14px; left: 14px; width: 38px; height: 38px; display: grid; place-items: center; border: 2px solid white; border-radius: 50%; color: white; background: var(--color-primary); }
.result-body { padding: 20px; }
.result-body h2 { margin: 0; font-size: 20px; }
.result-body p { min-height: 42px; color: var(--color-text-secondary); font-size: 14px; }
.result-body small { color: #717487; }
.result-body > div { margin: 16px 0; display: flex; flex-wrap: wrap; gap: 7px; }
.result-body .outline-button { min-height: 40px; float: right; }
.result-body .detail-link { display: inline-flex; }
.more-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--color-border); }
.more-section h2 { font-size: 19px; }
.mini-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.mini-grid article { padding: 10px; display: grid; grid-template-columns: 86px 1fr; gap: 10px; border: 1px solid var(--color-border); border-radius: 11px; cursor: pointer; }
.mini-grid article:hover { border-color: var(--color-primary); background: var(--color-primary-pale); }
.mini-grid img { width: 86px; height: 86px; object-fit: cover; border-radius: 8px; }
.mini-placeholder { width: 86px; height: 86px; display: grid; place-items: center; border-radius: 8px; color: #817a9a; background: #f2efff; font-size: 11px; }
.mini-grid strong { font-size: 13px; }.mini-grid p { margin: 6px 0; color: var(--color-text-secondary); font-size: 11px; }.mini-detail-link { color: var(--color-primary); font-weight: 750; }
.status-message { min-height: 380px; display: grid; place-items: center; color: var(--color-text-secondary); }
.status-message.error { color: #b23a3a; }
.fallback-notice { margin: 20px 0 0; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: 9px; color: var(--color-text-secondary); background: var(--color-primary-pale); }
@media (max-width: 1100px) { .result-page { grid-template-columns: 1fr; } .condition-panel { position: static; } .top-grid { grid-template-columns: 1fr 1fr; } .mini-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 650px) { .top-grid, .mini-grid { grid-template-columns: 1fr; } .result-panel { padding: 18px; } }
</style>
