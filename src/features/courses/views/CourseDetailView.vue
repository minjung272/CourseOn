<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchCourseById, fetchRelatedCourses } from '../services/courseService'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
})

const router = useRouter()
const course = ref(null)
const relatedCourses = ref([])
const loading = ref(true)
const errorMessage = ref('')
const imageFailed = ref(false)
const failedRelatedImages = ref(new Set())
const activeTab = ref('intro')
const saved = ref(false)
const noticeMessage = ref('')
const mapEl = ref(null)

const SAVED_COURSE_KEY = 'course-on:saved-course-ids'
let map
let noticeTimer
let loadSequence = 0

const mainTheme = computed(() => course.value?.tags.slice(0, 2).join(', ') || '서울여행')

function getSavedCourseIds() {
  try {
    const savedIds = JSON.parse(localStorage.getItem(SAVED_COURSE_KEY) ?? '[]')
    return Array.isArray(savedIds) ? savedIds.map(String) : []
  } catch {
    return []
  }
}

function syncSavedState() {
  saved.value = course.value ? getSavedCourseIds().includes(String(course.value.id)) : false
}

function showNotice(message) {
  window.clearTimeout(noticeTimer)
  noticeMessage.value = message
  noticeTimer = window.setTimeout(() => {
    noticeMessage.value = ''
  }, 2200)
}

function toggleSaved() {
  if (!course.value) return

  const courseId = String(course.value.id)
  const savedIds = new Set(getSavedCourseIds())

  if (savedIds.has(courseId)) {
    savedIds.delete(courseId)
    saved.value = false
    showNotice('저장한 코스에서 삭제했어요.')
  } else {
    savedIds.add(courseId)
    saved.value = true
    showNotice('내 코스에 저장했어요.')
  }

  localStorage.setItem(SAVED_COURSE_KEY, JSON.stringify([...savedIds]))
}

function goToCourseList() {
  router.push({ name: 'Courses' })
}

function goToMap() {
  router.push({ name: 'Map', query: { course: course.value?.id } })
}

function goToRecommend() {
  router.push({
    name: 'Recommend',
    query: { course: course.value?.id, theme: course.value?.tags[0] ?? '' },
  })
}

function goToRelatedCourse(courseId) {
  router.push({ name: 'CourseDetail', params: { courseId } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function markRelatedImageFailed(courseId) {
  failedRelatedImages.value = new Set([...failedRelatedImages.value, String(courseId)])
}

function renderMap() {
  map?.remove()
  map = null

  const latitude = Number(course.value?.latitude)
  const longitude = Number(course.value?.longitude)
  if (!mapEl.value || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return

  map = L.map(mapEl.value, {
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: true,
  }).setView([latitude, longitude], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  const markerIcon = L.divIcon({
    className: 'detail-marker-wrap',
    html: '<span class="detail-marker-dot"><span></span></span>',
    iconSize: [44, 52],
    iconAnchor: [22, 48],
  })

  L.marker([latitude, longitude], { icon: markerIcon })
    .addTo(map)
    .bindTooltip(course.value.title, {
      permanent: true,
      direction: 'top',
      offset: [0, -42],
      className: 'detail-map-label',
    })

  L.control.zoom({ position: 'bottomright' }).addTo(map)
  window.setTimeout(() => map?.invalidateSize(), 0)
}

watch(
  () => props.courseId,
  async (courseId) => {
    const sequence = ++loadSequence
    loading.value = true
    errorMessage.value = ''
    imageFailed.value = false
    failedRelatedImages.value = new Set()
    activeTab.value = 'intro'
    map?.remove()
    map = null

    try {
      const selectedCourse = await fetchCourseById(courseId)
      if (sequence !== loadSequence) return

      course.value = selectedCourse
      if (!selectedCourse) {
        relatedCourses.value = []
        errorMessage.value = '해당 여행코스를 찾을 수 없습니다.'
        return
      }

      relatedCourses.value = await fetchRelatedCourses(courseId)
      syncSavedState()
    } catch (error) {
      if (sequence !== loadSequence) return
      course.value = null
      relatedCourses.value = []
      errorMessage.value =
        error instanceof Error ? error.message : '여행코스 정보를 불러오지 못했습니다.'
    } finally {
      if (sequence === loadSequence) {
        loading.value = false
        await nextTick()
        renderMap()
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  map?.remove()
  window.clearTimeout(noticeTimer)
})
</script>

<template>
  <main class="course-detail-page page-shell">
    <nav class="breadcrumb" aria-label="현재 위치">
      <RouterLink to="/">홈</RouterLink><span>›</span>
      <RouterLink to="/courses">여행코스</RouterLink><span>›</span>
      <strong>코스 상세</strong>
    </nav>

    <section v-if="loading" class="status-card surface" aria-live="polite">
      <span class="loading-spinner" aria-hidden="true"></span>
      <h1>여행코스를 불러오고 있어요</h1>
      <p>잠시만 기다려 주세요.</p>
    </section>

    <section v-else-if="errorMessage" class="status-card surface" role="alert">
      <span class="status-icon" aria-hidden="true">!</span>
      <h1>{{ errorMessage }}</h1>
      <p>코스가 삭제되었거나 주소가 올바르지 않을 수 있어요.</p>
      <button type="button" class="outline-button" @click="goToCourseList">여행코스 목록으로</button>
    </section>

    <template v-else-if="course">
      <section class="course-hero surface">
        <div class="course-image-wrap">
          <img
            v-if="course.imageUrl && !imageFailed"
            class="course-image"
            :src="course.imageUrl"
            :alt="course.imageAlt || `${course.title} 대표 이미지`"
            @error="imageFailed = true"
          />
          <div
            v-else
            class="course-image-placeholder"
            role="img"
            :aria-label="`${course.title} 이미지 없음`"
          >
            이미지 준비 중
          </div>
          <span v-if="course.imageUrl && !imageFailed" class="image-count" aria-label="대표 이미지 1장">1 / 1</span>
        </div>

        <div class="course-summary">
          <p class="region-chip">{{ course.region.name }} · {{ course.districtName }}</p>
          <h1>{{ course.title }}</h1>

          <div class="course-tags" aria-label="코스 태그">
            <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
            <span v-if="course.tags.length === 0">서울여행</span>
          </div>

          <p class="summary-description">
            {{ course.description }}<br />
            지도를 확인하며 나만의 속도로 여유롭게 코스를 즐겨보세요.
          </p>

          <dl class="course-metadata">
            <div>
              <dt><span aria-hidden="true">◷</span> 소요시간</dt>
              <dd>{{ course.duration }}</dd>
            </div>
            <div>
              <dt><span aria-hidden="true">⌖</span> 지역</dt>
              <dd>{{ course.districtName }}, 서울</dd>
            </div>
            <div>
              <dt><span aria-hidden="true">♟</span> 추천 이동</dt>
              <dd>{{ course.transport }}</dd>
            </div>
            <div>
              <dt><span aria-hidden="true">#</span> 테마</dt>
              <dd>{{ mainTheme }}</dd>
            </div>
          </dl>

          <div class="hero-actions">
            <button
              type="button"
              class="outline-button save-button"
              :class="{ saved }"
              :aria-pressed="saved"
              @click="toggleSaved"
            >
              <span aria-hidden="true">{{ saved ? '♥' : '♡' }}</span>
              {{ saved ? '저장됨' : '저장하기' }}
            </button>
            <button type="button" class="primary-button recommend-button" @click="goToRecommend">
              <span aria-hidden="true">✦</span> 이 코스 추천받기
            </button>
          </div>
        </div>
      </section>

      <div class="detail-grid">
        <section class="content-panel surface">
          <div class="content-tabs" role="tablist" aria-label="코스 상세 메뉴">
            <button
              id="intro-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'intro'"
              aria-controls="intro-panel"
              :class="{ active: activeTab === 'intro' }"
              @click="activeTab = 'intro'"
            >
              코스 소개
            </button>
            <button
              id="schedule-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'schedule'"
              aria-controls="schedule-panel"
              :class="{ active: activeTab === 'schedule' }"
              @click="activeTab = 'schedule'"
            >
              코스 일정
            </button>
          </div>

          <div
            v-if="activeTab === 'intro'"
            id="intro-panel"
            class="tab-panel"
            role="tabpanel"
            aria-labelledby="intro-tab"
          >
            <div class="intro-heading">
              <span class="bot-icon" aria-hidden="true">✦</span>
              <div>
                <h2>코스 소개</h2>
                <p>
                  {{ course.description }} 여행지의 분위기와 {{ course.tags.slice(0, 2).join(', ') || '서울의 매력' }}을
                  함께 경험할 수 있도록 구성했어요.
                </p>
              </div>
            </div>

            <div class="feature-list">
              <article v-for="feature in course.features" :key="feature.title">
                <span aria-hidden="true">{{ feature.icon }}</span>
                <div>
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                </div>
              </article>
            </div>

            <dl class="category-info">
              <div><dt>여행 유형</dt><dd>{{ course.category.mainCode }}</dd></div>
              <div><dt>코스 분류</dt><dd>{{ course.category.middleCode }}</dd></div>
              <div><dt>상세 분류</dt><dd>{{ course.category.detailCode }}</dd></div>
            </dl>
          </div>

          <div
            v-else
            id="schedule-panel"
            class="tab-panel schedule-panel"
            role="tabpanel"
            aria-labelledby="schedule-tab"
          >
            <div class="schedule-heading">
              <h2>추천 일정</h2>
              <p>현장 상황과 머무는 시간에 따라 자유롭게 조정해 보세요.</p>
            </div>
            <ol class="timeline">
              <li v-for="(item, index) in course.itinerary" :key="`${item.time}-${item.title}`">
                <span class="timeline-number">{{ index + 1 }}</span>
                <div>
                  <small>{{ item.time }}</small>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section class="map-panel surface">
          <div class="section-heading">
            <div>
              <p>COURSE MAP</p>
              <h2>코스 위치</h2>
            </div>
            <button type="button" @click="goToMap">전체 지도 보기 ↗</button>
          </div>

          <div ref="mapEl" class="detail-map" :aria-label="`${course.title} 지도`"></div>

          <div class="map-info">
            <span class="map-info-pin" aria-hidden="true">⌖</span>
            <div>
              <strong>{{ course.districtName }} 코스 중심 위치</strong>
              <p>위도 {{ Number(course.latitude).toFixed(4) }} · 경도 {{ Number(course.longitude).toFixed(4) }}</p>
            </div>
          </div>
        </section>
      </div>

      <section v-if="relatedCourses.length" class="related-section surface">
        <div class="section-heading related-heading">
          <div>
            <p>YOU MAY ALSO LIKE</p>
            <h2>함께 둘러보기 좋은 코스</h2>
          </div>
          <RouterLink to="/courses">전체 코스 보기 ›</RouterLink>
        </div>

        <div class="related-grid">
          <article
            v-for="related in relatedCourses"
            :key="related.id"
            class="related-card"
            role="link"
            tabindex="0"
            :aria-label="`${related.title} 상세보기`"
            @click="goToRelatedCourse(related.id)"
            @keydown.enter="goToRelatedCourse(related.id)"
          >
            <img
              v-if="related.imageUrl && !failedRelatedImages.has(String(related.id))"
              :src="related.imageUrl"
              :alt="related.imageAlt || `${related.title} 대표 이미지`"
              @error="markRelatedImageFailed(related.id)"
            />
            <div
              v-else
              class="related-image-placeholder"
              role="img"
              :aria-label="`${related.title} 이미지 없음`"
            >
              이미지 준비 중
            </div>
            <div>
              <p>{{ related.districtName }}</p>
              <h3>{{ related.title }}</h3>
              <span v-for="tag in related.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
              <span class="related-detail-link">상세보기 →</span>
            </div>
          </article>
        </div>
      </section>
    </template>

    <Transition name="notice">
      <p v-if="noticeMessage" class="save-notice" role="status">{{ noticeMessage }}</p>
    </Transition>
  </main>
</template>

<style scoped>
.course-detail-page {
  color: var(--color-text);
}

.breadcrumb {
  margin: 0 2px 18px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #9698a8;
  font-size: 14px;
}

.breadcrumb a:hover { color: var(--color-primary); }
.breadcrumb strong { color: #6d6f80; font-weight: 600; }

.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: 30px;
  padding: 24px;
}

.course-image-wrap {
  position: relative;
  min-height: 410px;
  overflow: hidden;
  border-radius: 15px;
  background: #f1eff8;
}

.course-image,
.course-image-placeholder {
  width: 100%;
  height: 100%;
}

.course-image {
  object-fit: cover;
}

.course-image-placeholder,
.related-image-placeholder {
  display: grid;
  place-items: center;
  color: #817a9a;
  background: linear-gradient(135deg, #eeeaff, #f7f6fb);
  text-align: center;
}

.course-image-placeholder { min-height: 410px; font-size: 16px; }

.image-count {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 6px 10px;
  border-radius: 999px;
  color: white;
  background: rgba(24, 24, 39, 0.62);
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.course-summary {
  min-width: 0;
  padding: 14px 14px 8px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.region-chip {
  align-self: flex-start;
  margin: 0 0 16px;
  padding: 7px 11px;
  border-radius: 8px;
  color: var(--color-primary-deep);
  background: var(--color-primary-pale);
  font-size: 14px;
  font-weight: 750;
}

.course-summary h1 {
  margin: 0;
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1.25;
  letter-spacing: -0.045em;
}

.course-tags {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.course-tags span,
.related-card span {
  padding: 5px 9px;
  border-radius: 7px;
  color: var(--color-primary-deep);
  background: var(--color-primary-pale);
  font-size: 13px;
  font-weight: 650;
}

.summary-description {
  margin: 0 0 26px;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.course-metadata {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.course-metadata div {
  min-width: 0;
  padding: 2px 18px;
  border-left: 1px solid var(--color-border);
}

.course-metadata div:first-child { padding-left: 0; border-left: 0; }
.course-metadata dt { margin-bottom: 8px; color: #8a8b9c; font-size: 13px; }
.course-metadata dt span { margin-right: 5px; color: var(--color-primary); font-size: 20px; }
.course-metadata dd { margin: 0; overflow: hidden; font-size: 14px; font-weight: 750; text-overflow: ellipsis; }

.hero-actions {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 12px;
}

.hero-actions button { min-height: 56px; }
.save-button.saved { color: white; border-color: var(--color-primary); background: var(--color-primary); }
.recommend-button { font-size: 16px; }

.detail-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
  gap: 20px;
  align-items: stretch;
}

.content-panel,
.map-panel,
.related-section { padding: 24px; }

.content-tabs {
  margin: -24px -24px 0;
  padding: 0 24px;
  display: flex;
  gap: 32px;
  border-bottom: 1px solid var(--color-border);
}

.content-tabs button {
  position: relative;
  min-width: 110px;
  padding: 22px 8px 18px;
  border: 0;
  color: #898a9b;
  background: transparent;
  font-weight: 750;
  cursor: pointer;
}

.content-tabs button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: transparent;
}

.content-tabs button.active { color: var(--color-primary); }
.content-tabs button.active::after { background: var(--color-primary); }
.tab-panel { padding-top: 20px; }

.intro-heading {
  padding: 18px;
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  border: 1px solid var(--color-border-soft);
  border-radius: 14px;
  background: #fdfcff;
}

.bot-icon,
.feature-list article > span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--color-primary-pale);
  font-size: 20px;
}

.intro-heading h2,
.schedule-heading h2,
.section-heading h2 { margin: 0; font-size: 20px; letter-spacing: -0.025em; }
.intro-heading p { margin: 8px 0 0; color: var(--color-text-secondary); line-height: 1.7; }

.feature-list {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.feature-list article {
  min-width: 0;
  padding: 15px;
  display: flex;
  gap: 11px;
  border-radius: 12px;
  background: #faf9fd;
}

.feature-list h3 { margin: 2px 0 6px; font-size: 14px; }
.feature-list p { margin: 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.55; }

.category-info {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.category-info div { padding: 12px 14px; border: 1px solid var(--color-border-soft); border-radius: 10px; }
.category-info dt { color: #9697a7; font-size: 11px; }
.category-info dd { margin: 5px 0 0; font-size: 12px; font-weight: 750; }

.schedule-heading p { margin: 7px 0 0; color: var(--color-text-secondary); font-size: 13px; }
.timeline { margin: 22px 0 0; padding: 0; list-style: none; }
.timeline li { position: relative; padding: 0 0 22px 50px; display: grid; min-height: 72px; }
.timeline li:not(:last-child)::before { content: ''; position: absolute; top: 30px; bottom: 0; left: 16px; width: 1px; background: #dcd5ff; }
.timeline-number { position: absolute; top: 0; left: 0; z-index: 1; width: 33px; height: 33px; display: grid; place-items: center; border: 2px solid white; border-radius: 50%; color: white; background: var(--color-primary); box-shadow: 0 0 0 1px #dcd5ff; font-size: 12px; font-weight: 800; }
.timeline small { color: var(--color-primary); font-weight: 750; }
.timeline h3 { margin: 4px 0; font-size: 15px; }
.timeline p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.5; }

.section-heading {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.section-heading p { margin: 0 0 5px; color: var(--color-primary); font-size: 10px; font-weight: 800; letter-spacing: 0.12em; }
.section-heading button,
.related-heading a { padding: 8px 10px; border: 0; color: var(--color-primary-deep); background: transparent; font-size: 13px; font-weight: 750; cursor: pointer; }

.detail-map {
  height: 304px;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: 13px;
  background: #eef3ef;
}

.map-info {
  margin-top: 13px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-radius: 10px;
  background: var(--color-primary-pale);
}

.map-info-pin { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%; color: var(--color-primary); background: white; font-size: 20px; }
.map-info strong { font-size: 13px; }
.map-info p { margin: 4px 0 0; color: var(--color-text-secondary); font-size: 11px; }

.related-section { margin-top: 20px; }
.related-heading { align-items: center; }
.related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
.related-card { min-width: 0; overflow: hidden; display: grid; grid-template-columns: 150px minmax(0, 1fr); border: 1px solid var(--color-border); border-radius: 13px; cursor: pointer; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
.related-card:hover { border-color: var(--color-primary); box-shadow: 0 8px 22px rgba(92, 66, 196, .12); transform: translateY(-2px); }
.related-card:focus-visible { outline: 3px solid rgba(117, 89, 237, .35); outline-offset: 3px; }
.related-card img,
.related-image-placeholder { width: 150px; height: 100%; min-height: 155px; }
.related-card img { object-fit: cover; }
.related-image-placeholder { font-size: 12px; }
.related-card > div { min-width: 0; padding: 16px; }
.related-card p { margin: 0 0 7px; color: var(--color-primary); font-size: 12px; font-weight: 750; }
.related-card h3 { margin: 0 0 12px; overflow: hidden; display: -webkit-box; font-size: 15px; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.related-card span { margin-right: 4px; padding: 4px 6px; font-size: 10px; }
.related-detail-link { margin-top: 14px; display: block; color: var(--color-primary-deep); font-size: 12px; font-weight: 750; }

.status-card { min-height: 440px; padding: 60px 20px; display: grid; place-items: center; align-content: center; text-align: center; }
.status-card h1 { margin: 18px 0 7px; font-size: 24px; }
.status-card p { margin: 0 0 24px; color: var(--color-text-secondary); }
.status-icon { width: 50px; height: 50px; display: grid; place-items: center; border-radius: 50%; color: white; background: #ee6a7b; font-size: 25px; font-weight: 800; }
.loading-spinner { width: 46px; height: 46px; border: 4px solid #e8e3ff; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

.save-notice { position: fixed; z-index: 1200; right: 28px; bottom: 28px; margin: 0; padding: 14px 20px; border-radius: 11px; color: white; background: #29243b; box-shadow: var(--shadow-md); font-size: 14px; font-weight: 700; }
.notice-enter-active, .notice-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.notice-enter-from, .notice-leave-to { opacity: 0; transform: translateY(8px); }

:global(.detail-marker-wrap) { border: 0; background: transparent; }
:global(.detail-marker-dot) { position: relative; width: 44px; height: 44px; display: grid; place-items: center; border: 4px solid white; border-radius: 50% 50% 50% 12px; background: linear-gradient(135deg, #8c70ff, #6341df); box-shadow: 0 8px 22px rgba(75, 47, 195, 0.34); transform: rotate(-45deg); }
:global(.detail-marker-dot span) { width: 13px; height: 13px; border-radius: 50%; background: white; }
:global(.detail-map-label) { padding: 7px 10px; border: 0; border-radius: 8px; color: #282333; box-shadow: 0 5px 16px rgba(43, 35, 83, 0.16); font-family: inherit; font-weight: 750; }
:global(.detail-map-label::before) { display: none; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1180px) {
  .course-hero { grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); }
  .course-metadata { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 0; }
  .course-metadata div:nth-child(3) { padding-left: 0; border-left: 0; }
  .detail-grid { grid-template-columns: 1fr; }
  .related-card { grid-template-columns: 120px minmax(0, 1fr); }
  .related-card img, .related-image-placeholder { width: 120px; }
}

@media (max-width: 900px) {
  .course-hero { grid-template-columns: 1fr; }
  .course-image-wrap, .course-image-placeholder { min-height: 340px; }
  .related-grid { grid-template-columns: 1fr; }
  .related-card { grid-template-columns: 180px minmax(0, 1fr); }
  .related-card img, .related-image-placeholder { width: 180px; }
}

@media (max-width: 640px) {
  .breadcrumb { margin-bottom: 12px; font-size: 12px; }
  .course-hero, .content-panel, .map-panel, .related-section { padding: 15px; }
  .course-image-wrap, .course-image-placeholder { min-height: 250px; }
  .course-summary { padding: 8px 2px 2px; }
  .course-summary h1 { font-size: 28px; }
  .summary-description br { display: none; }
  .course-metadata { grid-template-columns: 1fr 1fr; }
  .course-metadata div { padding: 0 10px; }
  .hero-actions { grid-template-columns: 1fr; }
  .content-tabs { margin: -15px -15px 0; padding: 0 15px; }
  .content-tabs button { flex: 1; min-width: 0; }
  .intro-heading { grid-template-columns: 1fr; }
  .feature-list, .category-info { grid-template-columns: 1fr; }
  .detail-map { height: 270px; }
  .related-heading { align-items: flex-end; }
  .related-card { grid-template-columns: 112px minmax(0, 1fr); }
  .related-card img, .related-image-placeholder { width: 112px; }
  .related-card > div { padding: 13px; }
  .save-notice { right: 16px; bottom: 16px; left: 16px; text-align: center; }
}
</style>
