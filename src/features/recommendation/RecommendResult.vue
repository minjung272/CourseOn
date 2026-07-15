<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowRight, Sparkles } from '@lucide/vue'
import { fetchCourses } from '../courses/services/courseService'
import RecommendationResultCard from './components/RecommendationResultCard.vue'
import SelectedConditionsPanel from './components/SelectedConditionsPanel.vue'
import {
  buildConditionQuery,
  getConditionSummary,
  parseConditions,
  rankCourses,
} from './services/recommendationService'

const route = useRoute()
const router = useRouter()

const courses = ref([])
const loading = ref(true)
const errorMessage = ref('')

const conditions = computed(() => parseConditions(route.query))
const conditionSummary = computed(() => getConditionSummary(conditions.value))
const recommendation = computed(() => rankCourses(courses.value, conditions.value))
const topCourses = computed(() => recommendation.value.courses.slice(0, 3))
const additionalCourses = computed(() => recommendation.value.courses.slice(3, 7))

onMounted(async () => {
  try {
    courses.value = await fetchCourses()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '추천 코스를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function editConditions() {
  router.push({
    name: 'Recommend',
    query: buildConditionQuery(conditions.value),
  })
}

function showCourseDetail(course) {
  router.push({ name: 'CourseDetail', params: { courseId: course.id } })
}
</script>

<template>
  <main class="result-page">
    <SelectedConditionsPanel :items="conditionSummary" @edit="editConditions" />

    <section class="results-content" aria-labelledby="recommendation-result-title">
      <p v-if="loading" class="status-message">추천 코스를 계산하고 있습니다.</p>
      <p v-else-if="errorMessage" class="status-message error">{{ errorMessage }}</p>

      <template v-else>
        <header class="results-heading">
          <div>
            <div class="title-line">
              <Sparkles :size="24" :stroke-width="1.9" aria-hidden="true" />
              <h1 id="recommendation-result-title">추천 코스 TOP 3</h1>
            </div>
            <p>선택한 조건과 코스 태그의 일치 점수를 기준으로 추천했어요.</p>
          </div>

          <RouterLink to="/courses" class="all-courses-link">
            전체 코스 보기
            <ArrowRight :size="17" :stroke-width="1.9" aria-hidden="true" />
          </RouterLink>
        </header>

        <p v-if="recommendation.isFallback" class="fallback-notice">
          조건과 일치하는 태그가 없어 전체 코스를 기본 순서대로 보여드려요.
        </p>

        <div class="top-course-grid">
          <RecommendationResultCard
            v-for="(course, index) in topCourses"
            :key="course.key"
            :course="course"
            :rank="index + 1"
            @select="showCourseDetail"
          />
        </div>

        <section v-if="additionalCourses.length" class="additional-section" aria-labelledby="more-title">
          <h2 id="more-title">이런 코스는 어때요?</h2>
          <div class="additional-grid">
            <RecommendationResultCard
              v-for="course in additionalCourses"
              :key="course.key"
              :course="course"
              compact
              @select="showCourseDetail"
            />
          </div>
        </section>
      </template>
    </section>
  </main>
</template>

<style scoped>
.result-page {
  width: 100%;
  max-width: 1380px;
  margin: 4px auto 28px;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
}

.results-content {
  min-width: 0;
  padding: 26px;
  border: 1px solid #e6e1f0;
  border-radius: 8px;
  background: #fff;
}

.results-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ece9f3;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7355e9;
}

.title-line h1 {
  margin: 0;
  color: #211e29;
  font-size: 24px;
}

.results-heading p {
  margin: 7px 0 0 34px;
  color: #827c8e;
  font-size: 13px;
}

.all-courses-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #6848dd;
  font-size: 13px;
  font-weight: 750;
  white-space: nowrap;
}

.fallback-notice {
  margin: 18px 0 0;
  padding: 12px 14px;
  border: 1px solid #e4def7;
  border-radius: 7px;
  background: #faf9ff;
  color: #6d6281;
  font-size: 13px;
}

.top-course-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.additional-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #ece9f3;
}

.additional-section h2 {
  margin: 0 0 16px;
  font-size: 19px;
}

.additional-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.status-message {
  min-height: 420px;
  margin: 0;
  display: grid;
  place-items: center;
  color: #777181;
}

.status-message.error {
  color: #b23a3a;
}

@media (max-width: 1100px) {
  .result-page {
    grid-template-columns: 1fr;
  }

  .top-course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .results-content {
    padding: 18px;
  }

  .results-heading {
    flex-direction: column;
  }

  .top-course-grid,
  .additional-grid {
    grid-template-columns: 1fr;
  }

  .title-line h1 {
    font-size: 21px;
  }
}
</style>
