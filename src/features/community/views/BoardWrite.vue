<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PasswordModal from '../components/PasswordModal.vue'
import { createPost, getPostById, updatePost } from '../services/storage.js'
import { readImageAsBase64 } from '../utils/image.js'

const route = useRoute()
const router = useRouter()

const categoryOptions = ['여행 후기', '맛집 후기', '관광지 추천', '여행 팁', '자유게시판']
const form = ref({
  category: '',
  title: '',
  content: '',
  image: '',
  tags: [],
  password: '',
  author: '익명'
})
const tagInput = ref('')
const isDragging = ref(false)
const imageError = ref('')
const formError = ref('')
const passwordModalOpen = ref(false)
const passwordDraft = ref('')
const passwordError = ref('')
const isSubmitting = ref(false)

const isEditMode = computed(() => Boolean(route.params.id))
const pageTitle = computed(() => (isEditMode.value ? '게시글 수정' : '게시글 작성'))
const submitLabel = computed(() => (isEditMode.value ? '수정하기' : '등록하기'))

function resetForm() {
  form.value = {
    category: '',
    title: '',
    content: '',
    image: '',
    tags: [],
    password: '',
    author: '익명'
  }
  tagInput.value = ''
  imageError.value = ''
  formError.value = ''
  passwordDraft.value = ''
  passwordError.value = ''
}

function loadPost() {
  if (!isEditMode.value) {
    resetForm()
    return
  }

  const post = getPostById(route.params.id)
  if (!post) {
    alert('게시글이 존재하지 않습니다.')
    router.replace('/board')
    return
  }

  form.value = {
    category: post.category,
    title: post.title,
    content: post.content,
    image: post.image || '',
    tags: Array.isArray(post.tags) ? [...post.tags] : [],
    password: post.password,
    author: post.author || '익명'
  }
  passwordDraft.value = ''
  passwordError.value = ''
}

watch(
  () => route.params.id,
  () => {
    loadPost()
  }
)

onMounted(() => {
  loadPost()
})

function validateForm() {
  formError.value = ''

  if (!form.value.category) {
    formError.value = '카테고리를 선택해주세요.'
    return false
  }

  if (!form.value.title.trim()) {
    formError.value = '제목을 입력해주세요.'
    return false
  }

  if (form.value.title.length > 100) {
    formError.value = '제목은 100자 이하로 입력해주세요.'
    return false
  }

  if (!form.value.content.trim()) {
    formError.value = '내용을 입력해주세요.'
    return false
  }

  if (form.value.content.length > 3000) {
    formError.value = '내용은 3000자 이하로 입력해주세요.'
    return false
  }

  if (!form.value.password || form.value.password.length < 4 || form.value.password.length > 20) {
    formError.value = '비밀번호는 4~20자로 입력해주세요.'
    return false
  }

  if (form.value.tags.length > 5) {
    formError.value = '태그는 최대 5개까지 추가할 수 있습니다.'
    return false
  }

  return true
}

function addTag() {
  const tagText = tagInput.value.trim().replace(/^#/, '')
  if (!tagText) return

  const normalizedTag = `#${tagText}`
  if (form.value.tags.includes(normalizedTag)) {
    tagInput.value = ''
    return
  }

  if (form.value.tags.length >= 5) {
    formError.value = '태그는 최대 5개까지 추가할 수 있습니다.'
    return
  }

  form.value.tags.push(normalizedTag)
  tagInput.value = ''
  formError.value = ''
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter((item) => item !== tag)
}

function clearImage() {
  form.value.image = ''
  imageError.value = ''
}

async function handleImageSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    form.value.image = await readImageAsBase64(file)
    imageError.value = ''
  } catch (error) {
    imageError.value = error.message || '이미지를 업로드할 수 없습니다.'
  }
}

function onDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

async function onDrop(event) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  try {
    form.value.image = await readImageAsBase64(file)
    imageError.value = ''
  } catch (error) {
    imageError.value = error.message || '이미지를 업로드할 수 없습니다.'
  }
}

function openPasswordModal() {
  passwordDraft.value = ''
  passwordError.value = ''
  passwordModalOpen.value = true
}

function closePasswordModal() {
  passwordModalOpen.value = false
  passwordDraft.value = ''
  passwordError.value = ''
}

function handleSubmit() {
  if (!validateForm()) return

  if (!isEditMode.value) {
    createNewPost()
    return
  }

  openPasswordModal()
}

function createNewPost() {
  isSubmitting.value = true
  const newPost = createPost({
    category: form.value.category,
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    image: form.value.image,
    tags: form.value.tags,
    password: form.value.password,
    author: '익명'
  })

  setTimeout(() => {
    isSubmitting.value = false
    alert('등록되었습니다.')
    router.push(`/board/${newPost.id}`)
  }, 100)
}

function confirmPassword() {
  if (passwordDraft.value !== form.value.password) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  const updatedPost = updatePost(route.params.id, {
    category: form.value.category,
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    image: form.value.image,
    tags: form.value.tags,
    password: form.value.password,
    author: form.value.author || '익명'
  })

  closePasswordModal()
  if (updatedPost) {
    alert('수정되었습니다.')
    router.push(`/board/${updatedPost.id}`)
  }
}

function cancelWrite() {
  router.push('/board')
}
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <p class="eyebrow">Community</p>
        <h1>{{ pageTitle }}</h1>
      </div>
      <button class="btn btn-outline" type="button" @click="cancelWrite">취소</button>
    </div>

    <div class="content-grid">
      <section class="form-card">
        <div class="field-group">
          <label for="category">카테고리</label>
          <select id="category" v-model="form.category" class="form-control">
            <option value="">카테고리를 선택하세요</option>
            <option v-for="item in categoryOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div class="field-group">
          <label for="title">제목</label>
          <input id="title" v-model.trim="form.title" maxlength="100" class="form-control" placeholder="제목을 입력하세요" />
          <div class="helper-row">
            <span>{{ form.title.length }}/100</span>
          </div>
        </div>

        <div class="field-group">
          <label for="content">내용</label>
          <textarea id="content" v-model.trim="form.content" maxlength="3000" class="form-control textarea" placeholder="여행 경험을 자세히 적어주세요" />
          <div class="helper-row">
            <span>{{ form.content.length }}/3000</span>
          </div>
        </div>

        <div class="field-group">
          <label for="tagInput">태그</label>
          <input id="tagInput" v-model="tagInput" class="form-control" placeholder="#태그 입력 후 Enter" @keydown.enter.prevent="addTag" />
          <div class="tag-list">
            <span v-for="tag in form.tags" :key="tag" class="tag-badge" @click="removeTag(tag)">{{ tag }}</span>
          </div>
        </div>

        <div class="field-group">
          <label for="password">비밀번호</label>
          <input id="password" v-model="form.password" type="password" class="form-control" placeholder="4~20자 입력" />
        </div>

        <p v-if="formError" class="error-text">{{ formError }}</p>

        <button class="btn btn-primary submit-btn" type="button" :disabled="isSubmitting" @click="handleSubmit">
          {{ submitLabel }}
        </button>
      </section>

      <aside class="upload-card">
        <div class="upload-header">
          <h2>대표 이미지</h2>
          <p>jpg, jpeg, png / 5MB 이하</p>
        </div>

        <label
          class="dropzone"
          :class="{ active: isDragging }"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <input type="file" accept="image/png,image/jpeg,image/jpg" class="file-input" @change="handleImageSelect" />
          <span class="drop-title">이미지를 드래그 앤 드롭하거나 클릭해 업로드</span>
          <span class="drop-subtitle">업로드 후 미리보기가 표시됩니다.</span>
        </label>

        <div v-if="form.image" class="preview-box">
          <img :src="form.image" alt="미리보기" />
          <button class="btn btn-outline preview-delete" type="button" @click="clearImage">이미지 삭제</button>
        </div>

        <p v-if="imageError" class="error-text">{{ imageError }}</p>
      </aside>
    </div>

    <PasswordModal
      :open="passwordModalOpen"
      v-model="passwordDraft"
      title="비밀번호 확인"
      :error-message="passwordError"
      @confirm="confirmPassword"
      @cancel="closePasswordModal"
    />
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  background: #f8f9fc;
  color: #2f2f3a;
  font-family: 'Pretendard', 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

button,
input,
select,
textarea {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  background: #f8f9fc;
  padding: 24px;
}

.page-header {
  max-width: 1400px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #7c5cfc;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

h1 {
  margin: 0;
  font-size: 1.6rem;
}

.content-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
}

.form-card,
.upload-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

label {
  font-weight: 700;
  color: #1f2430;
}

.form-control {
  width: 100%;
  height: 48px;
  border: 1px solid #d9dce5;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
}

.textarea {
  min-height: 180px;
  padding: 12px;
  resize: vertical;
}

.helper-row {
  display: flex;
  justify-content: flex-end;
  color: #6b7280;
  font-size: 0.9rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #efe8ff;
  color: #7c5cfc;
  cursor: pointer;
}

.error-text {
  color: #ef4444;
  margin: 0 0 12px;
}

.btn {
  border-radius: 10px;
  border: 1px solid transparent;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 700;
}

.btn-outline {
  background: #fff;
  color: #7c5cfc;
  border-color: #7c5cfc;
}

.btn-primary {
  background: #7c5cfc;
  color: #fff;
}

.submit-btn {
  width: 100%;
}

.upload-header {
  margin-bottom: 16px;
}

.upload-header h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

.upload-header p {
  margin: 0;
  color: #6b7280;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 220px;
  border: 1.5px dashed #c8cfe0;
  border-radius: 14px;
  background: #f9f9ff;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.dropzone.active {
  border-color: #7c5cfc;
  background: #f2ebff;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.drop-title {
  font-weight: 700;
  color: #1f2430;
}

.drop-subtitle {
  color: #6b7280;
}

.preview-box {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-box img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 12px;
}

.preview-delete {
  width: 100%;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .page-shell {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>