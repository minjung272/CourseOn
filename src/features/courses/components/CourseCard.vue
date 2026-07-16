<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  isCourseSaved,
  SAVED_COURSES_CHANGED_EVENT,
  toggleSavedCourse,
} from '../services/savedCourseService'

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])
const imageFailed = ref(false)
const saved = ref(isCourseSaved(props.course.id))

function syncSavedState() {
  saved.value = isCourseSaved(props.course.id)
}

function toggleSave() {
  saved.value = toggleSavedCourse(props.course.id)
}

onMounted(() => window.addEventListener(SAVED_COURSES_CHANGED_EVENT, syncSavedState))
onBeforeUnmount(() => window.removeEventListener(SAVED_COURSES_CHANGED_EVENT, syncSavedState))
</script>

<template>
  <article class="course-card">
    <div class="course-image-wrap">
      <img
        v-if="course.imageUrl && !imageFailed"
        class="course-image"
        :src="course.imageUrl"
        :alt="`${course.title} 대표 이미지`"
        @error="imageFailed = true"
      />
      <div v-else class="image-placeholder" role="img" :aria-label="`${course.title} 이미지 없음`">
        이미지 준비 중
      </div>
    </div>

    <div class="course-content">
      <div class="course-title-row">
        <div>
          <p v-if="course.rating >= 4.8" class="popular-label">인기</p>
          <h3>{{ course.title }}</h3>
        </div>
        <p class="rating"><span>★</span> {{ course.rating || '4.6' }} <small>({{ course.reviews || 120 }})</small></p>
      </div>
      <p class="description">{{ course.description }}</p>
      <div class="course-tags" aria-label="코스 태그">
        <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="card-actions">
      <button type="button" class="detail-button" @click="emit('select', course)">상세보기</button>
      <button
        type="button"
        class="save-button"
        :class="{ saved }"
        :aria-label="saved ? '코스 저장 해제' : '코스 저장'"
        :aria-pressed="saved"
        @click.stop="toggleSave"
      >
        {{ saved ? '♥' : '♡' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.course-card {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e1f1;
  border-radius: 16px;
  background: #fff;
}

.course-image-wrap {
  height: 142px;
  overflow: hidden;
  border-radius: 12px;
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
  background: linear-gradient(135deg, #eeeaff, #f7f6fb);
  color: #817a9a;
}

h3 {
  margin: 0;
  font-size: 22px;
}

.course-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.course-title-row > div { display: flex; align-items: center; gap: 12px; }
.popular-label { margin: 0; padding: 5px 9px; border-radius: 7px; color: var(--color-primary-deep); background: var(--color-primary-pale); font-size: 13px; font-weight: 750; }
.description { margin: 14px 0 0; color: var(--color-text-secondary); }
.rating { margin: 0; white-space: nowrap; font-weight: 700; }
.rating span { color: var(--color-primary); }
.rating small { color: #9798aa; font-weight: 500; }

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.course-tags span {
  padding: 5px 9px;
  border-radius: 7px;
  background: #f2efff;
  color: #6847df;
  font-size: 13px;
}

.detail-button {
  padding: 11px 18px;
  border: 1px solid #7457e8;
  border-radius: 9px;
  background: #fff;
  color: #6341df;
  font-weight: 700;
  cursor: pointer;
}

.card-actions { display: flex; align-items: center; gap: 10px; }
.save-button { width: 44px; height: 44px; border: 1px solid #e4defd; border-radius: 10px; color: var(--color-primary); background: var(--color-primary-pale); cursor: pointer; font-size: 21px; }
.save-button.saved { color: #fff; border-color: var(--color-primary); background: var(--color-primary); }

@media (max-width: 900px) {
  .course-card {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .detail-button {
    grid-column: 2;
    justify-self: start;
  }
  .card-actions { grid-column: 2; }
}

@media (max-width: 620px) {
  .course-card {
    grid-template-columns: 1fr;
  }

  .course-image-wrap {
    height: 190px;
  }

  .detail-button {
    grid-column: 1;
  }
  .card-actions { grid-column: 1; }
  .course-title-row { flex-direction: column; }
}
</style>
