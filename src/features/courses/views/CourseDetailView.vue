<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCourseById } from '../services/courseService'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['back', 'show-map'])
const router = useRouter()

const course = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const imageFailed = ref(false)

function goToCourseList() {
  emit('back')
  router.push({ name: 'Courses' })
}

const modifiedDate = computed(() => {
  if (!course.value?.modifiedAt) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(
    new Date(course.value.modifiedAt),
  )
})

watch(
  () => props.courseId,
  async (courseId) => {
    loading.value = true
    errorMessage.value = ''
    imageFailed.value = false

    try {
      course.value = await fetchCourseById(courseId)

      if (!course.value) {
        errorMessage.value = '해당 여행코스를 찾을 수 없습니다.'
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : '여행코스 정보를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <main class="course-detail-page">
    <button type="button" class="back-button" @click="goToCourseList">← 여행코스 목록</button>

    <p v-if="loading" class="status-message">여행코스 정보를 불러오는 중입니다.</p>
    <p v-else-if="errorMessage" class="status-message error">{{ errorMessage }}</p>

    <template v-else-if="course">
      <section class="course-hero">
        <div class="course-image-wrap">
          <img
            v-if="course.imageUrl && !imageFailed"
            class="course-image"
            :src="course.imageUrl"
            :alt="`${course.title} 대표 이미지`"
            @error="imageFailed = true"
          />
          <div
            v-else
            class="image-placeholder"
            role="img"
            :aria-label="`${course.title} 이미지 없음`"
          >
            이미지 준비 중
          </div>
        </div>

        <div class="course-summary">
          <p class="region">{{ course.region.name }} 여행코스</p>
          <h1>{{ course.title }}</h1>

          <div class="course-tags" aria-label="코스 태그">
            <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
            <span v-if="course.tags.length === 0" class="empty-tag">등록된 태그 없음</span>
          </div>

          <dl class="course-metadata">
            <div>
              <dt>지역</dt>
              <dd>{{ course.region.name }}</dd>
            </div>
            <div>
              <dt>콘텐츠 ID</dt>
              <dd>{{ course.id }}</dd>
            </div>
            <div>
              <dt>최근 수정일</dt>
              <dd>{{ modifiedDate }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div class="detail-grid">
        <section class="detail-section">
          <h2>코스 소개</h2>
          <div class="notice-box">
            <h3>{{ course.title }}</h3>
            <p>원본 데이터에 상세 설명과 코스 일정 정보가 제공되지 않습니다.</p>
          </div>

          <dl class="category-info">
            <div>
              <dt>대분류</dt>
              <dd>{{ course.category.mainCode }}</dd>
            </div>
            <div>
              <dt>중분류</dt>
              <dd>{{ course.category.middleCode }}</dd>
            </div>
            <div>
              <dt>소분류</dt>
              <dd>{{ course.category.detailCode }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-section map-section">
          <div class="section-heading">
            <h2>코스 위치</h2>
            <button type="button" @click="emit('show-map', course)">지도에서 보기</button>
          </div>

          <div class="coordinate-box">
            <span class="map-pin" aria-hidden="true">●</span>
            <strong>{{ course.region.name }}</strong>
            <p>위도 {{ course.latitude }}</p>
            <p>경도 {{ course.longitude }}</p>
          </div>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.course-detail-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 24px 48px;
  color: #211e2a;
}

.back-button {
  margin-bottom: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #716b80;
  font: inherit;
  cursor: pointer;
}

.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: 30px;
  padding: 24px;
  border: 1px solid #e4e1f1;
  border-radius: 18px;
  background: #fff;
}

.course-image-wrap {
  min-height: 390px;
  overflow: hidden;
  border-radius: 14px;
}

.course-image,
.image-placeholder {
  width: 100%;
  height: 100%;
}

.course-image {
  display: block;
  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;
  min-height: 390px;
  background: linear-gradient(135deg, #eeeaff, #f7f6fb);
  color: #817a9a;
}

.course-summary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 8px;
}

.region {
  align-self: flex-start;
  margin: 0 0 18px;
  padding: 7px 11px;
  border-radius: 8px;
  background: #f2efff;
  color: #6847df;
  font-weight: 700;
}

h1 {
  margin: 0 0 20px;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.3;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 38px;
}

.course-tags span {
  padding: 6px 10px;
  border-radius: 7px;
  background: #f2efff;
  color: #6847df;
}

.course-tags .empty-tag {
  background: #f4f4f6;
  color: #77717f;
}

.course-metadata,
.category-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.course-metadata div {
  padding: 0 18px;
  border-left: 1px solid #e7e3ee;
}

.course-metadata div:first-child {
  padding-left: 0;
  border-left: 0;
}

dt {
  margin-bottom: 7px;
  color: #77717f;
  font-size: 14px;
}

dd {
  margin: 0;
  font-weight: 700;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
  gap: 18px;
  margin-top: 18px;
}

.detail-section {
  padding: 24px;
  border: 1px solid #e4e1f1;
  border-radius: 18px;
  background: #fff;
}

.detail-section h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.notice-box,
.coordinate-box {
  padding: 24px;
  border: 1px solid #e7e3ee;
  border-radius: 14px;
  background: #faf9fd;
}

.notice-box h3 {
  margin: 0 0 10px;
}

.notice-box p,
.coordinate-box p {
  margin: 5px 0 0;
  color: #716b80;
}

.category-info {
  gap: 12px;
  margin-top: 16px;
}

.category-info div {
  padding: 15px;
  border-radius: 10px;
  background: #f7f5fc;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-heading button {
  padding: 8px 12px;
  border: 1px solid #7457e8;
  border-radius: 8px;
  background: #fff;
  color: #6341df;
  cursor: pointer;
}

.coordinate-box {
  display: grid;
  place-items: center;
  min-height: 180px;
  text-align: center;
  background: linear-gradient(135deg, #f0edff, #f8f7fc);
}

.map-pin {
  color: #7457e8;
  font-size: 30px;
}

.status-message {
  padding: 80px 20px;
  border: 1px solid #e4e1f1;
  border-radius: 18px;
  background: #fff;
  text-align: center;
  color: #716b80;
}

.status-message.error {
  color: #b33a3a;
}

@media (max-width: 900px) {
  .course-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .course-image-wrap,
  .image-placeholder {
    min-height: 300px;
  }
}

@media (max-width: 620px) {
  .course-detail-page {
    padding: 20px 14px 36px;
  }

  .course-hero,
  .detail-section {
    padding: 16px;
  }

  .course-metadata,
  .category-info {
    grid-template-columns: 1fr;
  }

  .course-metadata div {
    padding: 12px 0;
    border-top: 1px solid #e7e3ee;
    border-left: 0;
  }
}
</style>
