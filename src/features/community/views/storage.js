const STORAGE_KEY = 'posts'

function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function normalizeId(id) {
  return Number(id)
}

function getPosts() {
  if (typeof window === 'undefined') return []

  const storedPosts = window.localStorage.getItem(STORAGE_KEY)
  if (!storedPosts) return []

  try {
    return JSON.parse(storedPosts)
  } catch (error) {
    console.error('게시글 저장소를 읽는 중 오류가 발생했습니다.', error)
    return []
  }
}

function savePosts(posts) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function getNextId() {
  const posts = getPosts()
  const ids = posts.map((post) => normalizeId(post.id))
  return ids.length ? Math.max(...ids) + 1 : 1
}

function createPost(payload) {
  const posts = getPosts()
  const newPost = {
    id: getNextId(),
    category: payload.category,
    title: payload.title,
    content: payload.content,
    image: payload.image || '',
    tags: payload.tags || [],
    password: payload.password,
    author: payload.author || '익명',
    createdAt: formatDate(),
    updatedAt: formatDate(),
    views: 0,
    ...payload
  }

  posts.unshift(newPost)
  savePosts(posts)
  return newPost
}

function getPostById(id) {
  return getPosts().find((post) => normalizeId(post.id) === normalizeId(id)) || null
}

function updatePost(id, payload) {
  const posts = getPosts()
  const targetIndex = posts.findIndex((post) => normalizeId(post.id) === normalizeId(id))

  if (targetIndex === -1) return null

  const updatedPost = {
    ...posts[targetIndex],
    ...payload,
    id: normalizeId(id),
    updatedAt: formatDate()
  }

  posts[targetIndex] = updatedPost
  savePosts(posts)
  return updatedPost
}

function incrementViews(id) {
  const post = getPostById(id)
  if (!post) return null

  const updatedPost = updatePost(id, {
    views: Number(post.views || 0) + 1
  })

  return updatedPost
}

function deletePost(id) {
  const posts = getPosts().filter((post) => normalizeId(post.id) !== normalizeId(id))
  savePosts(posts)
  return true
}

export { createPost, deletePost, getPostById, getPosts, incrementViews, savePosts, updatePost }