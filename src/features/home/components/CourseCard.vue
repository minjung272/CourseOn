<template>
  <article class="course-card">
    <RouterLink class="course-image-link" :to="`/courses/${course.id}`" :aria-label="`${course.title} 상세 보기`">
      <img class="course-image" :src="course.image" :alt="course.imageAlt" />
      <span class="rank-badge">{{ course.rank }}위</span>
    </RouterLink>

    <div class="course-content">
      <div class="course-heading">
        <div>
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
        </div>
        <RouterLink class="arrow-link" :to="`/courses/${course.id}`" aria-label="상세 보기">›</RouterLink>
      </div>

      <div class="tags" aria-label="코스 태그">
        <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
      </div>

      <div class="course-meta">
        <span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.6"/>
            <path d="M10 6v4l2.6 1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          {{ course.duration }}
        </span>
        <i></i>
        <span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="4.7" r="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 18v-5l-2.2-2.2M12 18v-5l2.3-2.4M7.5 8.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ course.transport }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  course: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.course-card {
  min-width: 0;
  min-height: 172px;
  padding: 8px;
  display: grid;
  grid-template-columns: minmax(170px, 45%) 1fr;
  gap: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.course-image-link {
  position: relative;
  min-height: 154px;
  overflow: hidden;
  border-radius: 11px;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.course-card:hover .course-image {
  transform: scale(1.04);
}

.rank-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 9px;
  border-radius: 8px;
  color: white;
  background: linear-gradient(135deg, #7c5cf5, #6040e9);
  box-shadow: 0 5px 12px rgba(80, 56, 210, 0.3);
  font-size: 13px;
  font-weight: 800;
}

.course-content {
  min-width: 0;
  padding: 10px 10px 8px 0;
  display: flex;
  flex-direction: column;
}

.course-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

h3 {
  margin: 0;
  font-size: 16px;
  letter-spacing: -0.02em;
}

.course-heading p {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.arrow-link {
  flex: 0 0 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: #4e5872;
  font-size: 28px;
  line-height: 1;
}

.tags {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  padding: 5px 10px;
  border-radius: 999px;
  color: var(--color-primary-deep);
  background: var(--color-primary-pale);
  font-size: 12px;
  font-weight: 700;
}

.course-meta {
  margin-top: auto;
  padding-top: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6c7387;
  font-size: 13px;
}

.course-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.course-meta svg {
  width: 17px;
  height: 17px;
}

.course-meta i {
  width: 1px;
  height: 16px;
  background: var(--color-border);
}

@media (max-width: 1280px) {
  .course-card {
    grid-template-columns: 42% 1fr;
  }
}

@media (max-width: 560px) {
  .course-card {
    grid-template-columns: 1fr;
  }

  .course-image-link {
    height: 200px;
  }
}
</style>
