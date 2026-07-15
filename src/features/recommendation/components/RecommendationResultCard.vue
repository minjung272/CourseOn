<script setup>
import { ArrowRight, MapPin, Sparkles } from '@lucide/vue'
import { ref } from 'vue'

defineProps({
  course: {
    type: Object,
    required: true,
  },
  rank: {
    type: Number,
    default: null,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
const imageFailed = ref(false)
</script>

<template>
  <article class="result-card" :class="{ compact }">
    <div class="image-wrap">
      <img
        v-if="course.imageUrl && !imageFailed"
        :src="course.imageUrl"
        :alt="`${course.title} 대표 이미지`"
        @error="imageFailed = true"
      />
      <div v-else class="image-placeholder" role="img" :aria-label="`${course.title} 이미지 없음`">
        <MapPin :size="30" :stroke-width="1.6" aria-hidden="true" />
      </div>
      <span v-if="rank" class="rank-badge">{{ rank }}</span>
    </div>

    <div class="card-body">
      <div class="score-line">
        <Sparkles :size="15" :stroke-width="2" aria-hidden="true" />
        추천 점수 {{ course.recommendation.score }}점
      </div>
      <h3>{{ course.title }}</h3>

      <p v-if="course.recommendation.reasons.length" class="match-reason">
        {{ course.recommendation.reasons[0].label }} 조건과
        {{ course.recommendation.reasons[0].tags.join('·') }} 태그가 잘 맞아요.
      </p>
      <p v-else class="match-reason">조건에 맞는 기본 코스 순서로 추천했어요.</p>

      <div class="tag-list" aria-label="일치한 코스 태그">
        <span
          v-for="tag in course.recommendation.matchedTags.length
            ? course.recommendation.matchedTags
            : course.tags"
          :key="tag"
        >
          #{{ tag }}
        </span>
      </div>

      <button type="button" class="detail-button" @click="emit('select', course)">
        상세보기
        <ArrowRight :size="17" :stroke-width="1.9" aria-hidden="true" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e4dff0;
  border-radius: 8px;
  background: #fff;
}

.image-wrap {
  position: relative;
  aspect-ratio: 16 / 8.8;
  overflow: hidden;
  background: #f3f1fa;
}

.image-wrap img,
.image-placeholder {
  width: 100%;
  height: 100%;
}

.image-wrap img {
  display: block;
  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;
  color: #8068e9;
}

.rank-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: #6c4de5;
  color: #fff;
  box-shadow: 0 6px 14px rgba(69, 44, 160, 0.26);
  font-weight: 800;
}

.card-body {
  padding: 18px;
}

.score-line {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6a4be0;
  font-size: 12px;
  font-weight: 750;
}

.card-body h3 {
  min-height: 48px;
  margin: 9px 0 8px;
  color: #25212d;
  font-size: 18px;
  line-height: 1.35;
}

.match-reason {
  min-height: 42px;
  margin: 0;
  color: #777181;
  font-size: 13px;
  line-height: 1.55;
}

.tag-list {
  min-height: 31px;
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-list span {
  padding: 5px 8px;
  border-radius: 7px;
  background: #f2efff;
  color: #6747db;
  font-size: 11px;
  font-weight: 700;
}

.detail-button {
  min-height: 38px;
  margin: 16px 0 0 auto;
  padding: 0 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #8065eb;
  border-radius: 7px;
  background: #fff;
  color: #6545de;
  font-weight: 750;
  cursor: pointer;
}

.detail-button:hover {
  background: #f7f5ff;
}

.compact {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
}

.compact .image-wrap {
  aspect-ratio: auto;
  min-height: 166px;
}

.compact .card-body {
  padding: 14px;
}

.compact .card-body h3 {
  min-height: 0;
  margin-top: 6px;
  font-size: 15px;
}

.compact .match-reason {
  min-height: 0;
  font-size: 12px;
}

.compact .tag-list {
  min-height: 0;
  margin-top: 10px;
}

.compact .detail-button {
  min-height: 34px;
  margin-top: 10px;
  font-size: 12px;
}

@media (max-width: 560px) {
  .compact {
    grid-template-columns: 1fr;
  }

  .compact .image-wrap {
    min-height: 180px;
  }
}
</style>
