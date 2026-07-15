<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import CourseCard from '../components/CourseCard.vue'
import CourseFilter from '../components/CourseFilter.vue'
import CourseDetailView from './CourseDetailView.vue'
import { collectCourseTags, fetchCourses, filterCourses } from '../services/courseService'

const emit = defineEmits(['select-course'])

const PAGE_SIZE = 6
const courses = ref([])
const keyword = ref('')
const selectedTags = ref([])
const currentPage = ref(1)
const loading = ref(true)
const errorMessage = ref('')
const selectedCourseId = ref(null)

const tags = computed(() => collectCourseTags(courses.value))
const filteredCourses = computed(() =>
  filterCourses(courses.value, keyword.value, selectedTags.value),
)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCourses.value.length / PAGE_SIZE)))
const visibleCourses = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredCourses.value.slice(start, start + PAGE_SIZE)
})

watch([keyword, selectedTags], () => {
  currentPage.value = 1
})

onMounted(async () => {
  try {
    courses.value = await fetchCourses()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
})

function toggleTag(tag) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((selectedTag) => selectedTag !== tag)
    : [...selectedTags.value, tag]
}

function resetFilters() {
  keyword.value = ''
  selectedTags.value = []
}

function movePage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function showCourseDetail(course) {
  selectedCourseId.value = course.id
  emit('select-course', course)
}

function showCourseList() {
  selectedCourseId.value = null
}
</script>

<template>
  <CourseDetailView
    v-if="selectedCourseId"
    :course-id="selectedCourseId"
    @back="showCourseList"
  />

  <main v-else class="course-list-page">
    <CourseFilter
      v-model:keyword="keyword"
      :tags="tags"
      :selected-tags="selectedTags"
      @toggle-tag="toggleTag"
      @reset="resetFilters"
    />

    <section class="course-results" aria-live="polite">
      <p v-if="loading" class="status-message">여행코스를 불러오는 중입니다.</p>
      <p v-else-if="errorMessage" class="status-message error">{{ errorMessage }}</p>

      <template v-else>
        <header class="result-header">
          <p>총 <strong>{{ filteredCourses.length }}</strong>개의 서울 여행코스</p>
        </header>

        <div v-if="visibleCourses.length" class="course-cards">
          <CourseCard
            v-for="course in visibleCourses"
            :key="course.key"
            :course="course"
            @select="showCourseDetail"
          />
        </div>
        <p v-else class="status-message">검색 조건에 맞는 여행코스가 없습니다.</p>

        <nav v-if="filteredCourses.length > PAGE_SIZE" class="pagination" aria-label="페이지 이동">
          <button type="button" :disabled="currentPage === 1" @click="movePage(currentPage - 1)">
            이전
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="{ active: page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="movePage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="movePage(currentPage + 1)"
          >
            다음
          </button>
        </nav>
      </template>
    </section>
  </main>
</template>

<style scoped>
.course-list-page {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 36px 24px;
  color: #211e2a;
}

.course-results {
  min-width: 0;
  padding: 22px;
  border: 1px solid #e4e1f1;
  border-radius: 16px;
  background: #fff;
}

.result-header {
  margin-bottom: 20px;
}

.result-header p {
  margin: 0;
}

.result-header strong {
  color: #6847df;
}

.course-cards {
  display: grid;
  gap: 12px;
}

.status-message {
  padding: 60px 20px;
  text-align: center;
  color: #716b80;
}

.status-message.error {
  color: #b33a3a;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.pagination button {
  min-width: 38px;
  padding: 8px;
  border: 1px solid #ded9ef;
  border-radius: 7px;
  background: #fff;
  cursor: pointer;
}

.pagination button.active {
  border-color: #6847df;
  background: #6847df;
  color: #fff;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 760px) {
  .course-list-page {
    grid-template-columns: 1fr;
    padding: 20px 14px;
  }
}
</style>
