<script setup>
import { ref } from 'vue'

defineProps({
  course: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])
const imageFailed = ref(false)
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
      <p class="region">{{ course.region.name }}</p>
      <h3>{{ course.title }}</h3>
      <div class="course-tags" aria-label="코스 태그">
        <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <button type="button" class="detail-button" @click="emit('select', course)">상세보기</button>
  </article>
</template>

<style scoped>
.course-card {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e4e1f1;
  border-radius: 14px;
  background: #fff;
}

.course-image-wrap {
  height: 136px;
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

.region {
  margin: 0 0 6px;
  color: #7457e8;
  font-size: 14px;
  font-weight: 700;
}

h3 {
  margin: 0 0 18px;
  font-size: 21px;
}

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

@media (max-width: 900px) {
  .course-card {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .detail-button {
    grid-column: 2;
    justify-self: start;
  }
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
}
</style>
