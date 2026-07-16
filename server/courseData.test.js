import test from 'node:test'
import assert from 'node:assert/strict'
import { generateChatResponse, selectRelevantCourses } from './chatService.js'
import { loadCourses } from './index.js'

test('챗봇은 정제된 서울 여행코스 51건만 후보로 사용한다', async () => {
  const courses = await loadCourses()

  assert.equal(courses.length, 51)
  assert.equal(new Set(courses.map(({ id }) => String(id))).size, 51)
  assert.ok(courses.every(({ id }) => !String(id).startsWith('map-')))
})

test('챗봇 추천 카드 ID는 실제 코스 상세 페이지 ID와 일치한다', async () => {
  const courses = await loadCourses()
  const realCourseIds = new Set(courses.map(({ id }) => String(id)))
  const selected = selectRelevantCourses(courses, '종로구 역사 산책 코스 추천해줘', 3)

  assert.ok(selected.length > 0)
  assert.ok(selected.every(({ id }) => realCourseIds.has(id)))
  assert.ok(selected.every(({ id }) => !id.startsWith('map-')))
})

test('데이터가 없는 강동구를 요청하면 다른 지역 코스를 반환하지 않는다', async () => {
  const courses = await loadCourses()

  assert.deepEqual(selectRelevantCourses(courses, '강동구 코스 추천해줘', 3), [])
  assert.deepEqual(selectRelevantCourses(courses, '강동구에서 산책하고 싶어', 3), [])
})

test('데이터가 있는 지역을 요청하면 해당 지역 코스만 반환한다', async () => {
  const courses = await loadCourses()
  const historyCourses = selectRelevantCourses(courses, '종로구 역사 코스 추천해줘', 3)
  const unmatchedThemeCourses = selectRelevantCourses(courses, '종로구 맛집 코스 추천해줘', 3)

  assert.ok(historyCourses.length > 0)
  assert.ok(historyCourses.every(({ district }) => district === '종로구'))
  assert.ok(unmatchedThemeCourses.length > 0)
  assert.ok(unmatchedThemeCourses.every(({ district }) => district === '종로구'))
})

test('지역 데이터가 없으면 OpenAI를 호출하지 않고 안내 응답을 반환한다', async () => {
  const courses = await loadCourses()
  let called = false
  const client = { responses: { create: async () => {
    called = true
    throw new Error('호출되면 안 됨')
  } } }

  const result = await generateChatResponse({
    client,
    model: 'test-model',
    message: '강동구를 추천해줘',
    history: [],
    courses,
  })

  assert.equal(called, false)
  assert.deepEqual(result.courses, [])
  assert.match(result.answer, /강동구 데이터가 없습니다/)
})

test('지역 없는 산책 질문은 전체 데이터에서 산책 코스를 우선한다', async () => {
  const courses = await loadCourses()
  const selected = selectRelevantCourses(courses, '서울 산책 코스 추천해줘', 3)

  assert.ok(selected.length > 0)
  assert.ok(selected[0].tags.includes('산책'))
  assert.ok(selected.every(({ id }) => courses.some((course) => String(course.id) === id)))
})
