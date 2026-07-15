<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createBoard, fetchBoard, updateBoard } from './services/boardService'

const route = useRoute()
const router = useRouter()
const isEditing = computed(() => route.name === 'BoardEdit')
const loading = ref(false)
const submitting = ref(false)
const submitError = ref('')
const tagsInput = ref('')
const form = reactive({
  category: '',
  title: '',
  author: '',
  content: '',
  password: '',
  imageUrl: null,
})
const categories = ['여행 후기', '질문 & 답변', '여행 팁', '자유 게시판']

function tagsFromInput() {
  return [...new Set(tagsInput.value.split(/[,#\n]/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 5)
}

async function previewImage(event) {
  const file = event.target.files?.[0]
  if (!file) return
  submitError.value = ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    submitError.value = 'JPG 또는 PNG 이미지만 등록할 수 있습니다.'
    event.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    submitError.value = '대표 이미지는 5MB 이하여야 합니다.'
    event.target.value = ''
    return
  }

  form.imageUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  }).catch((error) => {
    submitError.value = error.message
    return null
  })
}

function validateForm() {
  if (!form.category) return '카테고리를 선택해주세요.'
  if (!form.title.trim()) return '제목을 입력해주세요.'
  if (!form.author.trim()) return '작성자를 입력해주세요.'
  if (!form.content.trim()) return '내용을 입력해주세요.'
  if (!form.password.trim()) return '비밀번호를 입력해주세요. 공백만 입력할 수 없습니다.'
  if (form.password.trim().length < 4 || form.password.trim().length > 20) return '비밀번호는 공백을 제외하고 4~20자로 입력해주세요.'
  return ''
}

async function loadPost() {
  if (!isEditing.value) return
  loading.value = true
  submitError.value = ''
  try {
    const post = await fetchBoard(route.params.id, { incrementViews: false })
    form.category = post.category
    form.title = post.title
    form.author = post.author
    form.content = post.content
    form.imageUrl = post.imageUrl
    tagsInput.value = (post.tags || []).join(', ')
  } catch (error) {
    submitError.value = error.message
  } finally {
    loading.value = false
  }
}

async function submit() {
  const validationMessage = validateForm()
  if (validationMessage) {
    submitError.value = validationMessage
    return
  }

  submitting.value = true
  submitError.value = ''
  const payload = {
    category: form.category,
    title: form.title.trim(),
    author: form.author.trim(),
    content: form.content.trim(),
    tags: tagsFromInput(),
    password: form.password.trim(),
    imageUrl: form.imageUrl,
  }

  try {
    const saved = isEditing.value
      ? await updateBoard(route.params.id, payload)
      : await createBoard(payload)
    await router.replace(`/boards/${saved.id}`)
  } catch (error) {
    submitError.value = error.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadPost)
</script>

<template>
  <main class="write-page page-shell">
    <form class="surface write-form" @submit.prevent="submit">
      <header><h1>{{ isEditing ? '게시글 수정' : '게시글 작성' }}</h1><p>{{ isEditing ? '작성 시 설정한 비밀번호가 일치해야 수정할 수 있습니다.' : '서울 여행에 대한 나만의 이야기를 공유해보세요.' }}</p></header>
      <div v-if="loading" class="form-state"><span class="spinner"></span><p>게시글을 불러오는 중입니다.</p></div>
      <template v-else>
        <div class="form-grid">
          <section>
            <label>카테고리<select v-model="form.category" required><option value="">☆　카테고리를 선택해주세요</option><option v-for="item in categories" :key="item">{{ item }}</option></select></label>
            <label>제목<input v-model="form.title" required maxlength="100" placeholder="제목을 입력해주세요 (최대 100자)"></label>
            <label>작성자<input v-model="form.author" required maxlength="30" placeholder="표시할 작성자 이름을 입력해주세요"></label>
            <label>내용<div class="editor"><div class="toolbar">본문　│　<b>B</b>　<i>I</i>　<u>U</u>　☷　☰　≡</div><textarea v-model="form.content" required maxlength="3000" placeholder="여행에 대한 자세한 내용을 입력해주세요."></textarea><small>{{ form.content.length }} / 3000</small></div></label>
            <label>태그 (선택)<input v-model="tagsInput" maxlength="120" placeholder="쉼표로 태그를 구분해주세요"><small>예) 데이트, 야경, 맛집, 감성　최대 5개까지 등록 가능</small></label>
            <label>비밀번호<input v-model="form.password" type="password" minlength="4" maxlength="20" required :autocomplete="isEditing ? 'current-password' : 'new-password'" :placeholder="isEditing ? '게시글 작성 시 설정한 비밀번호' : '게시글 수정/삭제 시 필요합니다 (4~20자)'"><small>* 공백만 입력할 수 없으며 비밀번호는 서버에서 암호화되어 저장됩니다.</small></label>
          </section>
          <section><strong>대표 이미지 <small>(선택)</small></strong><label class="image-upload"><input type="file" accept="image/png,image/jpeg" @change="previewImage"><img v-if="form.imageUrl" :src="form.imageUrl" alt="업로드 이미지 미리보기"><template v-else><span>▧</span><p>클릭하여 이미지를 업로드하세요.</p><small>JPG, PNG 파일만 가능 (최대 5MB)</small></template></label><button v-if="form.imageUrl" class="remove-image" type="button" @click="form.imageUrl = null">대표 이미지 제거</button></section>
        </div>
        <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>
        <footer><button class="outline-button" type="button" :disabled="submitting" @click="router.back()">취소</button><button class="primary-button" type="submit" :disabled="submitting">{{ submitting ? '저장 중...' : (isEditing ? '수정하기' : '등록하기') }}</button></footer>
      </template>
    </form>
  </main>
</template>

<style scoped>
.write-page { max-width: 1320px; }.write-form { padding: 34px 40px 24px; }.write-form header h1 { margin: 0; }.write-form header p { color: var(--color-text-secondary); }.form-grid { margin-top: 26px; display: grid; grid-template-columns: 1.35fr .8fr; gap: 48px; }.form-grid section:first-child { display: grid; gap: 18px; }.form-grid label, .form-grid strong { display: grid; gap: 8px; font-size: 14px; }.form-grid input, .form-grid select { height: 48px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 7px; background: white; }.form-grid small { color: #9294a4; font-weight: 400; }.editor { overflow: hidden; border: 1px solid var(--color-border); border-radius: 7px; }.toolbar { height: 44px; padding: 12px 14px; border-bottom: 1px solid var(--color-border); color: #595c70; }.editor textarea { width: 100%; height: 170px; padding: 14px; border: 0; resize: vertical; outline: 0; }.editor small { padding: 0 12px 8px; display: block; text-align: right; }.image-upload { min-height: 240px; display: grid !important; place-items: center; align-content: center; overflow: hidden; border: 1px dashed #b9b1df; border-radius: 7px; text-align: center; cursor: pointer; }.image-upload input { display: none; }.image-upload span { color: var(--color-primary); font-size: 50px; }.image-upload p { color: var(--color-text-secondary); }.image-upload img { width: 100%; height: 240px; object-fit: cover; }.remove-image { width: 100%; margin-top: 10px; padding: 10px; border: 0; border-radius: 8px; color: #a33c45; background: #fff2f3; cursor: pointer; }.form-error { margin: 24px 0 0; padding: 12px 14px; border: 1px solid #efc3c7; border-radius: 8px; color: #ae3944; background: #fff6f6; }.write-form footer { margin-top: 34px; padding-top: 18px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--color-border); }.write-form footer button { min-width: 130px; }.write-form button:disabled { opacity: .55; cursor: not-allowed; }.form-state { min-height: 480px; display: grid; place-items: center; align-content: center; color: var(--color-text-secondary); }.spinner { width: 32px; height: 32px; border: 3px solid #e6e1fb; border-top-color: var(--color-primary); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 850px) { .form-grid { grid-template-columns: 1fr; }.write-form { padding: 26px 18px; } }
</style>
