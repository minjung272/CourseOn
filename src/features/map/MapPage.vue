<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapCourses, mapDistricts } from '../../shared/data/mapCourses'

const router = useRouter()
const mapEl = ref(null)
const selectedCourse = ref(mapCourses.find((course) => course.region.districtCode === '강서구'))
const query = ref('')
const district = ref('전체')
let map
let markerLayer

const visibleCourses = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return mapCourses.filter((course) => {
    const matchesDistrict = district.value === '전체' || course.region.districtCode === district.value
    const haystack = `${course.title} ${course.region.districtCode} ${course.tags.join(' ')}`.toLowerCase()
    return matchesDistrict && (!keyword || haystack.includes(keyword))
  })
})

function selectCourse(course) {
  selectedCourse.value = course
  map?.flyTo([course.latitude, course.longitude], 14, { duration: 0.7 })
}

function renderMarkers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()
  visibleCourses.value.forEach((course, index) => {
    const icon = L.divIcon({ className: 'course-marker-wrap', html: `<span class="course-marker">${index + 1}</span>`, iconSize: [38, 46], iconAnchor: [19, 42] })
    L.marker([course.latitude, course.longitude], { icon }).addTo(markerLayer).on('click', () => selectCourse(course))
  })

  if (district.value !== '전체' && visibleCourses.value[0]) {
    selectCourse(visibleCourses.value[0])
  }
}

function resetFilters() {
  query.value = ''
  district.value = '전체'
  selectedCourse.value = null
  map?.setView([37.5665, 126.978], 11)
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
  renderMarkers()
})

watch(visibleCourses, renderMarkers)

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <main class="map-page">
    <section class="map-area surface">
      <div class="map-filters">
        <label><span>⌕</span><input v-model="query" type="search" placeholder="장소, 코스, 키워드로 검색하세요"></label>
        <select v-model="district" aria-label="서울 구 선택"><option>전체</option><option v-for="name in mapDistricts" :key="name">{{ name }}</option></select>
        <select><option>테마</option><option>데이트</option><option>힐링</option></select>
        <select><option>코스 유형</option><option>산책</option><option>맛집</option></select>
        <select><option>소요 시간</option><option>3시간 이내</option><option>반나절</option></select>
        <button type="button" @click="resetFilters">↻ 필터 초기화</button>
      </div>
      <div ref="mapEl" class="leaflet-map"></div>
      <article v-if="selectedCourse" class="map-popup surface">
        <button type="button" aria-label="팝업 닫기" @click="selectedCourse = null">×</button>
        <img :src="selectedCourse.imageUrl" :alt="selectedCourse.imageAlt">
        <div><strong>{{ selectedCourse.title }}</strong><p>{{ selectedCourse.region.districtCode }} · {{ selectedCourse.description }}</p><span v-for="tag in selectedCourse.tags.slice(0, 3)" :key="tag" class="tag-chip">{{ tag }}</span><RouterLink :to="selectedCourse.detailId ? `/courses/${selectedCourse.detailId}` : '/courses'">상세보기 ›</RouterLink></div>
      </article>
    </section>

    <aside class="surface map-sidebar">
      <header><h1>추천 코스</h1><button type="button">↻ 새로고침</button></header>
      <div class="map-course-list">
        <button v-for="(course, index) in visibleCourses" :key="course.id" type="button" :class="{ active: selectedCourse?.id === course.id }" @click="selectCourse(course)">
          <img :src="course.imageUrl" :alt="course.imageAlt"><span><strong>{{ index + 1 }}. {{ course.title }}</strong><small>{{ course.region.districtCode }} · {{ course.tags.slice(0, 2).join(' · ') }}</small><i><em v-for="tag in course.tags.slice(0, 3)" :key="tag">{{ tag }}</em></i></span><b>›</b>
        </button>
      </div>
      <p v-if="visibleCourses.length === 0" class="empty-courses">조건에 맞는 코스가 없습니다.</p>
      <button class="outline-button save-course" type="button" @click="router.push('/recommend')">♡ 내 코스로 저장</button>
    </aside>
  </main>
</template>

<style scoped>
.map-page { width: min(calc(100% - 48px), 1660px); height: calc(100vh - var(--header-height) - 36px); min-height: 680px; margin: 28px auto 8px; display: grid; grid-template-columns: minmax(0, 1fr) 470px; gap: 16px; }
.map-area { position: relative; min-width: 0; overflow: hidden; }
.map-filters { height: 92px; padding: 20px; display: grid; grid-template-columns: minmax(280px, 1fr) repeat(4, 125px) auto; gap: 12px; align-items: center; }
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
.map-popup { position: absolute; z-index: 500; top: 220px; left: 50%; width: 360px; padding: 14px; display: grid; grid-template-columns: 110px 1fr; gap: 14px; transform: translateX(-50%); }
.map-popup > button { position: absolute; top: 7px; right: 10px; border: 0; background: transparent; font-size: 20px; cursor: pointer; }
.map-popup img { width: 110px; height: 90px; object-fit: cover; border-radius: 9px; }
.map-popup strong { display: block; padding-right: 18px; font-size: 14px; }.map-popup p { margin: 6px 0; color: var(--color-text-secondary); font-size: 11px; }.map-popup .tag-chip { padding: 3px 6px; margin-right: 4px; font-size: 10px; }.map-popup a { margin-top: 8px; display: block; color: var(--color-primary); font-size: 12px; font-weight: 700; }
.map-sidebar { padding: 24px 24px 92px; display: flex; flex-direction: column; overflow: hidden; }
.map-sidebar header { display: flex; align-items: center; justify-content: space-between; }.map-sidebar h1 { margin: 0; font-size: 22px; }.map-sidebar header button { border: 0; color: #9697a6; background: transparent; cursor: pointer; }
.map-course-list { min-height: 0; margin-top: 20px; padding-right: 4px; display: grid; gap: 10px; overflow-y: auto; }
.map-course-list > button { width: 100%; min-height: 112px; padding: 12px; display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 14px; border: 1px solid var(--color-border); border-radius: 12px; text-align: left; background: white; cursor: pointer; }
.map-course-list > button.active { border-color: var(--color-primary); background: var(--color-primary-pale); }
.map-course-list img { width: 120px; height: 86px; object-fit: cover; border-radius: 9px; }.map-course-list strong { display: block; font-size: 14px; }.map-course-list small { margin: 7px 0; display: block; color: var(--color-text-secondary); font-size: 11px; }.map-course-list i { display: flex; gap: 5px; font-style: normal; }.map-course-list em { padding: 3px 6px; border-radius: 5px; color: var(--color-primary); background: var(--color-primary-pale); font-size: 10px; font-style: normal; }.map-course-list b { color: var(--color-primary); font-size: 24px; }
.save-course { width: 100%; margin-top: 12px; }
.empty-courses { margin: 40px 0; color: var(--color-text-secondary); text-align: center; }
:global(.course-marker-wrap) { background: transparent; border: 0; }
:global(.course-marker) { position: relative; width: 38px; height: 38px; display: grid; place-items: center; border: 3px solid white; border-radius: 50%; color: white; background: linear-gradient(135deg, #8b70ff, #6544df); box-shadow: 0 5px 15px rgba(72, 49, 190, .3); font-weight: 800; }
:global(.course-marker)::after { content: ''; position: absolute; left: 50%; bottom: -8px; border: 6px solid transparent; border-top-color: #6544df; transform: translateX(-50%); }
@media (max-width: 1200px) { .map-page { height: auto; grid-template-columns: 1fr; }.map-area { min-height: 650px; }.map-filters { grid-template-columns: 1fr 1fr 1fr; height: auto; }.leaflet-map { height: 560px; }.map-sidebar { overflow: visible; }.map-course-list { max-height: 620px; } }
@media (max-width: 640px) { .map-page { width: calc(100% - 24px); margin-top: 12px; }.map-filters { grid-template-columns: 1fr 1fr; padding: 12px; }.map-filters label { grid-column: 1/-1; }.map-popup { width: calc(100% - 28px); grid-template-columns: 86px 1fr; }.map-popup img { width: 86px; }.map-course-list > button { grid-template-columns: 90px 1fr auto; }.map-course-list img { width: 90px; } }
</style>
