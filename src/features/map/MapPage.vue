<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  collectMapDistricts,
  collectMapThemes,
  fetchMapCourses,
  filterMapCourses,
} from './services/mapCourseService'

const route = useRoute()
const router = useRouter()
const mapEl = ref(null)
const courses = ref([])
const selectedCourse = ref(null)
const query = ref('')
const district = ref('전체')
const theme = ref('전체')
const loading = ref(true)
const errorMessage = ref('')
const failedImages = ref(new Set())
let map
let markerLayer

const mapDistricts = computed(() => collectMapDistricts(courses.value))
const mapThemes = computed(() => collectMapThemes(courses.value))
const visibleCourses = computed(() => filterMapCourses(courses.value, {
  keyword: query.value,
  district: district.value,
  theme: theme.value,
}))

function canShowImage(course) {
  return Boolean(course.imageUrl) && !failedImages.value.has(course.id)
}

function markImageFailed(courseId) {
  failedImages.value = new Set([...failedImages.value, courseId])
}

function selectCourse(course, { animate = true } = {}) {
  selectedCourse.value = course
  if (!map) return

  if (animate) {
    map.flyTo([course.latitude, course.longitude], 14, { duration: 0.7 })
  } else {
    map.setView([course.latitude, course.longitude], 14)
  }
}

function goToCourseDetail(course) {
  router.push({ name: 'CourseDetail', params: { courseId: course.id } })
}

function selectCourseFromRoute() {
  const courseId = String(route.query.course || '')
  if (!courseId || courses.value.length === 0) return

  const course = courses.value.find(({ id }) => id === courseId)
  if (course) selectCourse(course, { animate: false })
}

function renderMarkers() {
  if (!map || !markerLayer) return

  markerLayer.clearLayers()
  visibleCourses.value.forEach((course, index) => {
    const icon = L.divIcon({
      className: 'course-marker-wrap',
      html: `<span class="course-marker">${index + 1}</span>`,
      iconSize: [38, 46],
      iconAnchor: [19, 42],
    })

    L.marker([course.latitude, course.longitude], { icon })
      .addTo(markerLayer)
      .on('click', () => selectCourse(course))
  })

  if (selectedCourse.value && !visibleCourses.value.some(({ id }) => id === selectedCourse.value.id)) {
    selectedCourse.value = null
  }
}

function resetFilters() {
  query.value = ''
  district.value = '전체'
  theme.value = '전체'
  selectedCourse.value = null
  map?.setView([37.5665, 126.978], 11)
}

async function loadCourses({ reset = false } = {}) {
  loading.value = true
  errorMessage.value = ''

  if (reset) resetFilters()

  try {
    courses.value = await fetchMapCourses()
    failedImages.value = new Set()
    await nextTick()
    renderMarkers()
    if (!reset) selectCourseFromRoute()
  } catch (error) {
    courses.value = []
    selectedCourse.value = null
    errorMessage.value = error instanceof Error
      ? error.message
      : '지도용 여행코스를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  map = L.map(mapEl.value, { zoomControl: false }).setView([37.5665, 126.978], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  await loadCourses()
})

watch(visibleCourses, renderMarkers)
watch(() => route.query.course, selectCourseFromRoute)

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <main class="map-page">
    <section class="map-area surface">
      <div class="map-filters">
        <label>
          <span>⌕</span>
          <input v-model="query" type="search" placeholder="장소, 지역, 태그로 검색하세요">
        </label>
        <select v-model="district" aria-label="서울 구 선택">
          <option>전체</option>
          <option v-for="name in mapDistricts" :key="name">{{ name }}</option>
        </select>
        <select v-model="theme" aria-label="여행 테마 선택">
          <option>전체</option>
          <option v-for="name in mapThemes" :key="name">{{ name }}</option>
        </select>
        <button type="button" @click="resetFilters">↻ 필터 초기화</button>
      </div>

      <div ref="mapEl" class="leaflet-map"></div>

      <article
        v-if="selectedCourse"
        class="map-popup surface"
        role="link"
        tabindex="0"
        :aria-label="`${selectedCourse.title} 상세보기`"
        @click="goToCourseDetail(selectedCourse)"
        @keydown.enter="goToCourseDetail(selectedCourse)"
      >
        <button type="button" aria-label="팝업 닫기" @click.stop="selectedCourse = null">×</button>
        <img
          v-if="canShowImage(selectedCourse)"
          :src="selectedCourse.imageUrl"
          :alt="`${selectedCourse.title} 대표 이미지`"
          @error="markImageFailed(selectedCourse.id)"
        >
        <div v-else class="popup-placeholder">이미지 준비 중</div>
        <div>
          <strong>{{ selectedCourse.title }}</strong>
          <p>{{ selectedCourse.districtName }} · {{ selectedCourse.tags.join(' · ') || '태그 없음' }}</p>
          <span v-for="tag in selectedCourse.tags.slice(0, 3)" :key="tag" class="tag-chip">{{ tag }}</span>
          <span class="detail-link">상세보기 ›</span>
        </div>
      </article>
    </section>

    <aside class="surface map-sidebar">
      <header>
        <div>
          <h1>서울 여행코스</h1>
          <small>총 {{ visibleCourses.length }}개</small>
        </div>
        <button type="button" :disabled="loading" @click="loadCourses({ reset: true })">↻ 새로고침</button>
      </header>

      <p v-if="loading" class="course-status">여행코스를 불러오고 있습니다.</p>
      <p v-else-if="errorMessage" class="course-status error">{{ errorMessage }}</p>

      <div v-else class="map-course-list">
        <button
          v-for="(course, index) in visibleCourses"
          :key="course.id"
          type="button"
          :class="{ active: selectedCourse?.id === course.id }"
          @click="selectCourse(course)"
        >
          <img
            v-if="canShowImage(course)"
            :src="course.imageUrl"
            :alt="`${course.title} 대표 이미지`"
            @error="markImageFailed(course.id)"
          >
          <div v-else class="list-placeholder">이미지 준비 중</div>
          <span>
            <strong>{{ index + 1 }}. {{ course.title }}</strong>
            <small>{{ course.districtName }} · {{ course.tags.slice(0, 2).join(' · ') || '태그 없음' }}</small>
            <i><em v-for="tag in course.tags.slice(0, 3)" :key="tag">{{ tag }}</em></i>
          </span>
          <b>›</b>
        </button>
      </div>

      <p v-if="!loading && !errorMessage && visibleCourses.length === 0" class="empty-courses">
        조건에 맞는 코스가 없습니다.
      </p>
      <button class="outline-button save-course" type="button" @click="router.push('/recommend')">
        나에게 맞는 코스 추천받기
      </button>
    </aside>
  </main>
</template>

<style scoped>
.map-page { width: min(calc(100% - 48px), 1660px); height: calc(100vh - var(--header-height) - 36px); min-height: 680px; margin: 28px auto 8px; display: grid; grid-template-columns: minmax(0, 1fr) 470px; gap: 16px; }
.map-area { position: relative; min-width: 0; overflow: hidden; }
.map-filters { height: 92px; padding: 20px; display: grid; grid-template-columns: minmax(280px, 1fr) 150px 150px auto; gap: 12px; align-items: center; }
.map-filters label { height: 50px; padding: 0 16px; display: flex; align-items: center; gap: 10px; border: 1px solid #a996ff; border-radius: 10px; }
.map-filters input { min-width: 0; width: 100%; border: 0; outline: 0; }
.map-filters select, .map-filters button { height: 50px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 10px; background: white; }
.leaflet-map {
  height: calc(100% - 92px);
  min-height: 560px;
  background-color: #eef3ef !important;
  background-image:
    linear-gradient(29deg, transparent 46%, rgba(181, 195, 211, .55) 47%, rgba(181, 195, 211, .55) 49%, transparent 50%),
    linear-gradient(-31deg, transparent 46%, rgba(205, 214, 225, .75) 47%, rgba(205, 214, 225, .75) 49%, transparent 50%),
    radial-gradient(ellipse at 48% 55%, rgba(148, 211, 242, .62) 0 8%, transparent 8.5%),
    radial-gradient(circle at 22% 25%, rgba(176, 220, 175, .6) 0 12%, transparent 12.5%);
  background-size: 170px 140px, 210px 180px, 100% 100%, 100% 100%;
}
.map-popup { position: absolute; z-index: 500; top: 150px; left: 50%; width: 380px; padding: 14px; display: grid; grid-template-columns: 110px 1fr; gap: 14px; transform: translateX(-50%); cursor: pointer; }
.map-popup:focus-visible { outline: 3px solid rgba(117, 89, 237, .35); outline-offset: 3px; }
.map-popup > button { position: absolute; top: 7px; right: 10px; border: 0; background: transparent; font-size: 20px; cursor: pointer; }
.map-popup img, .popup-placeholder { width: 110px; height: 90px; border-radius: 9px; }
.map-popup img { object-fit: cover; }
.popup-placeholder, .list-placeholder { display: grid; place-items: center; color: #817a9a; background: linear-gradient(135deg, #eeeaff, #f7f6fb); font-size: 11px; text-align: center; }
.map-popup strong { display: block; padding-right: 18px; font-size: 14px; }
.map-popup p { margin: 6px 0; color: var(--color-text-secondary); font-size: 11px; }
.map-popup .tag-chip { padding: 3px 6px; margin-right: 4px; font-size: 10px; }
.map-popup .detail-link { margin-top: 8px; display: block; color: var(--color-primary); font-size: 12px; font-weight: 700; }
.map-sidebar { padding: 24px 24px 92px; display: flex; flex-direction: column; overflow: hidden; }
.map-sidebar header { display: flex; align-items: center; justify-content: space-between; }
.map-sidebar header > div { display: flex; align-items: baseline; gap: 10px; }
.map-sidebar h1 { margin: 0; font-size: 22px; }
.map-sidebar header small { color: var(--color-primary); font-weight: 700; }
.map-sidebar header button { border: 0; color: #777487; background: transparent; cursor: pointer; }
.map-sidebar header button:disabled { cursor: wait; opacity: .55; }
.map-course-list { min-height: 0; margin-top: 20px; padding-right: 4px; display: grid; gap: 10px; overflow-y: auto; }
.map-course-list > button { width: 100%; min-height: 112px; padding: 12px; display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 14px; border: 1px solid var(--color-border); border-radius: 12px; text-align: left; background: white; cursor: pointer; }
.map-course-list > button.active { border-color: var(--color-primary); background: var(--color-primary-pale); }
.map-course-list img, .list-placeholder { width: 120px; height: 86px; border-radius: 9px; }
.map-course-list img { object-fit: cover; }
.map-course-list strong { display: block; font-size: 14px; }
.map-course-list small { margin: 7px 0; display: block; color: var(--color-text-secondary); font-size: 11px; }
.map-course-list i { display: flex; flex-wrap: wrap; gap: 5px; font-style: normal; }
.map-course-list em { padding: 3px 6px; border-radius: 5px; color: var(--color-primary); background: var(--color-primary-pale); font-size: 10px; font-style: normal; }
.map-course-list b { color: var(--color-primary); font-size: 24px; }
.save-course { width: 100%; margin-top: 12px; }
.course-status, .empty-courses { margin: 40px 0; color: var(--color-text-secondary); text-align: center; }
.course-status.error { color: #b23a3a; }
:global(.course-marker-wrap) { background: transparent; border: 0; }
:global(.course-marker) { position: relative; width: 38px; height: 38px; display: grid; place-items: center; border: 3px solid white; border-radius: 50%; color: white; background: linear-gradient(135deg, #8b70ff, #6544df); box-shadow: 0 5px 15px rgba(72, 49, 190, .3); font-weight: 800; }
:global(.course-marker)::after { content: ''; position: absolute; left: 50%; bottom: -8px; border: 6px solid transparent; border-top-color: #6544df; transform: translateX(-50%); }
@media (max-width: 1200px) { .map-page { height: auto; grid-template-columns: 1fr; }.map-area { min-height: 650px; }.map-filters { grid-template-columns: 1fr 1fr; height: auto; }.map-filters label { grid-column: 1/-1; }.leaflet-map { height: 560px; }.map-sidebar { overflow: visible; }.map-course-list { max-height: 620px; } }
@media (max-width: 640px) { .map-page { width: calc(100% - 24px); margin-top: 12px; }.map-filters { grid-template-columns: 1fr; padding: 12px; }.map-filters label { grid-column: auto; }.map-popup { width: calc(100% - 28px); grid-template-columns: 86px 1fr; }.map-popup img, .popup-placeholder { width: 86px; }.map-course-list > button { grid-template-columns: 90px 1fr auto; }.map-course-list img, .list-placeholder { width: 90px; } }
</style>
