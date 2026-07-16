import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const routerSource = await readFile(new URL('../src/app/router/index.js', import.meta.url), 'utf8')
const layoutSource = await readFile(new URL('../src/app/layouts/DefaultLayout.vue', import.meta.url), 'utf8')
const courseServiceSource = await readFile(
  new URL('../src/features/courses/services/courseService.js', import.meta.url),
  'utf8',
)
const redirectsSource = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')
const netlifySource = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8')

test('필수 화면 경로가 모두 라우터에 등록되어 있다', () => {
  const requiredPaths = [
    '/',
    '/courses',
    '/courses/:courseId',
    '/recommend',
    '/recommend/result',
    '/map',
    '/boards',
    '/boards/write',
    '/boards/:id/edit',
    '/boards/:id',
    '/chatbot',
  ]

  for (const path of requiredPaths) {
    assert.match(routerSource, new RegExp(`path:\\s*['\"]${path.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['\"]`))
  }
})

test('전체 화면에서 공통 Header·Footer·챗봇을 사용한다', () => {
  assert.match(layoutSource, /<AppHeader\s*\/>/)
  assert.match(layoutSource, /<AppFooter\s*\/>/)
  assert.match(layoutSource, /<ChatbotWidget\s*\/>/)
  assert.match(layoutSource, /<RouterView\s*\/>/)
})

test('여행코스 서비스는 더미 코스를 섞지 않는다', () => {
  assert.doesNotMatch(courseServiceSource, /demoContent|featuredCourses|demo-/)
  assert.match(courseServiceSource, /cachedCourses\s*=\s*normalizedCourses/)
})

test('Netlify에서 챗봇 API와 SPA 새로고침 경로를 처리한다', () => {
  assert.match(redirectsSource, /\/api\/chat\s+\/\.netlify\/functions\/chat\s+200/)
  assert.match(redirectsSource, /\/\*\s+\/index\.html\s+200/)
  assert.match(netlifySource, /functions\s*=\s*"netlify\/functions"/)
})
