<template>
  <div class="home-page">
    <div class="home-container">
      <HeroBanner />
      <SearchPanel />

      <section class="popular-section" aria-labelledby="popular-title">
        <div class="section-heading">
          <h2 id="popular-title">인기 코스</h2>
          <RouterLink to="/courses">더보기 <span aria-hidden="true">›</span></RouterLink>
        </div>

        <div class="course-grid">
          <CourseCard v-for="course in courses" :key="course.id" :course="course" />
        </div>
      </section>

      <div class="bottom-grid">
        <SeoulMapPanel />
        <TravelStats />
      </div>
    </div>
  </div>
</template>

<script setup>
import HeroBanner from './components/HeroBanner.vue'
import SearchPanel from './components/SearchPanel.vue'
import CourseCard from './components/CourseCard.vue'
import SeoulMapPanel from './components/SeoulMapPanel.vue'
import TravelStats from './components/TravelStats.vue'
import { featuredCourses } from '../../shared/data/demoContent'

const courses = [featuredCourses[1], featuredCourses[2], featuredCourses[0]].map((course, index) => ({
  ...course,
  rank: index + 1,
  image: course.imageUrl,
}))
</script>

<style scoped>
.home-page {
  padding: 30px 0 0;
}

.home-container {
  width: min(100% - 48px, var(--layout-max-width));
  margin: 0 auto;
}

.popular-section {
  margin: 22px 64px 0;
}

.section-heading {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-heading h2 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.03em;
}

.section-heading a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
}

.section-heading a span {
  font-size: 24px;
  line-height: 1;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.bottom-grid {
  margin: 24px 64px 0;
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 16px;
}

@media (max-width: 1280px) {
  .popular-section,
  .bottom-grid {
    margin-inline: 0;
  }

  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .course-grid > :last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .home-page {
    padding-top: 20px;
  }

  .course-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .course-grid > :last-child {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .home-container {
    width: min(100% - 28px, var(--layout-max-width));
  }

  .section-heading h2 {
    font-size: 19px;
  }
}
</style>
