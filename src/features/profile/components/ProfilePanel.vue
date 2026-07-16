<script setup>
import { reactive, ref, watch } from 'vue'
import { fetchCourseById } from '../../courses/services/courseService'
import { clearSavedCourses, getSavedCourseIds } from '../../courses/services/savedCourseService'
import { clearLocalProfile, getLocalProfile, saveLocalProfile } from '../services/profileService'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'profile-updated'])
const form = reactive({ name: '', password: '' })
const savedCourses = ref([])
const message = ref('')
const errorMessage = ref('')
const loadingCourses = ref(false)

async function loadPanel() {
  const profile = getLocalProfile()
  form.name = profile?.name ?? ''
  form.password = profile?.password ?? ''
  message.value = ''
  errorMessage.value = ''
  loadingCourses.value = true

  try {
    const courses = await Promise.all(getSavedCourseIds().map((courseId) => fetchCourseById(courseId)))
    savedCourses.value = courses.filter(Boolean)
  } catch {
    savedCourses.value = []
    errorMessage.value = '저장한 코스를 불러오지 못했습니다.'
  } finally {
    loadingCourses.value = false
  }
}

function saveProfile() {
  message.value = ''
  errorMessage.value = ''

  try {
    const profile = saveLocalProfile(form)
    message.value = '프로필을 저장했어요.'
    emit('profile-updated', profile)
  } catch (error) {
    errorMessage.value = error.message
  }
}

function clearProfile() {
  clearLocalProfile()
  clearSavedCourses()
  form.name = ''
  form.password = ''
  savedCourses.value = []
  message.value = '프로필과 저장한 코스를 초기화했어요.'
  errorMessage.value = ''
  emit('profile-updated', null)
}

watch(() => props.open, (open) => { if (open) loadPanel() }, { immediate: true })
</script>

<template>
  <div v-if="open" class="profile-backdrop" role="presentation" @click.self="emit('close')">
    <aside class="profile-panel surface" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <header>
        <div><small>LOCAL PROFILE</small><h2 id="profile-title">간이 프로필</h2></div>
        <button type="button" aria-label="프로필 닫기" @click="emit('close')">×</button>
      </header>

      <form @submit.prevent="saveProfile">
        <label>이름<input v-model="form.name" maxlength="30" autocomplete="nickname" placeholder="게시판에 표시할 이름"></label>
        <label>게시판 기본 비밀번호<input v-model="form.password" type="password" minlength="4" maxlength="20" autocomplete="new-password" placeholder="4~20자"></label>
        <p class="profile-notice">실제 로그인이 아닌 현재 브라우저용 데모 프로필입니다.</p>
        <p v-if="errorMessage" class="profile-message error" role="alert">{{ errorMessage }}</p>
        <p v-else-if="message" class="profile-message" role="status">{{ message }}</p>
        <div class="profile-actions">
          <button class="outline-button" type="button" @click="clearProfile">초기화</button>
          <button class="primary-button" type="submit">저장하기</button>
        </div>
      </form>

      <section class="saved-section">
        <div><h3>저장한 코스</h3><strong>{{ savedCourses.length }}개</strong></div>
        <p v-if="loadingCourses" class="empty-message">코스를 불러오는 중입니다.</p>
        <p v-else-if="savedCourses.length === 0" class="empty-message">저장한 코스가 없습니다.</p>
        <ul v-else>
          <li v-for="course in savedCourses" :key="course.id">
            <RouterLink :to="`/courses/${course.id}`" @click="emit('close')">
              <img v-if="course.imageUrl" :src="course.imageUrl" :alt="course.title">
              <span v-else class="course-placeholder">서울</span>
              <span><strong>{{ course.title }}</strong><small>{{ course.districtName }}</small></span>
              <b>›</b>
            </RouterLink>
          </li>
        </ul>
      </section>
    </aside>
  </div>
</template>

<style scoped>
.profile-backdrop { position: fixed; z-index: 1400; inset: 0; background: rgba(29, 24, 50, .2); }
.profile-panel { position: absolute; top: 86px; right: max(24px, calc((100vw - var(--layout-max-width)) / 2)); width: min(390px, calc(100vw - 28px)); max-height: calc(100vh - 106px); padding: 24px; overflow-y: auto; box-shadow: 0 18px 48px rgba(42, 32, 85, .22); }
.profile-panel > header { display: flex; align-items: flex-start; justify-content: space-between; }.profile-panel header small { color: var(--color-primary); font-size: 10px; font-weight: 800; letter-spacing: .12em; }.profile-panel h2 { margin: 4px 0 0; font-size: 23px; }.profile-panel header button { border: 0; color: #858397; background: transparent; cursor: pointer; font-size: 27px; }
.profile-panel form { margin-top: 22px; display: grid; gap: 14px; }.profile-panel label { display: grid; gap: 7px; font-size: 13px; font-weight: 700; }.profile-panel input { height: 45px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; }.profile-notice { margin: -2px 0 0; color: var(--color-text-secondary); font-size: 11px; }.profile-message { margin: 0; color: #3d8060; font-size: 12px; }.profile-message.error { color: #b43b46; }.profile-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }.profile-actions button { min-height: 43px; }
.saved-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border); }.saved-section > div { display: flex; align-items: center; justify-content: space-between; }.saved-section h3 { margin: 0; font-size: 16px; }.saved-section > div > strong { color: var(--color-primary); }.saved-section ul { margin: 12px 0 0; padding: 0; display: grid; gap: 8px; list-style: none; }.saved-section a { padding: 7px; display: grid; grid-template-columns: 58px minmax(0, 1fr) auto; align-items: center; gap: 9px; border: 1px solid var(--color-border-soft); border-radius: 9px; color: inherit; }.saved-section img, .course-placeholder { width: 58px; height: 44px; object-fit: cover; border-radius: 7px; }.course-placeholder { display: grid; place-items: center; color: var(--color-primary); background: var(--color-primary-pale); font-size: 10px; }.saved-section a > span:nth-child(2) { min-width: 0; }.saved-section a strong, .saved-section a small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.saved-section a strong { font-size: 12px; }.saved-section a small { margin-top: 4px; color: var(--color-text-secondary); font-size: 10px; }.saved-section a b { color: var(--color-primary); }.empty-message { margin: 12px 0 0; padding: 18px; border-radius: 9px; color: var(--color-text-secondary); background: #faf9fd; text-align: center; font-size: 12px; }
@media (max-width: 600px) { .profile-panel { top: 74px; right: 14px; padding: 20px; } }
</style>
