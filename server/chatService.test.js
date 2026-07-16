import test from 'node:test'
import assert from 'node:assert/strict'
import { extractResponseText, generateChatResponse, mapOpenAIError, selectRelevantCourses } from './chatService.js'

const courses = [
  { id: 1, title: '강서 한강 산책', region: { districtCode: '4' }, tags: ['자연', '산책'], latitude: 1, longitude: 1 },
  { id: 2, title: '강동 야경 여행', region: { districtCode: '2' }, tags: ['야경'], latitude: 2, longitude: 2 },
  { id: 3, title: '종로 역사 탐방', region: { districtCode: '23' }, tags: ['역사'], latitude: 3, longitude: 3 },
]

test('질문에 언급된 구와 테마를 우선 선별한다', () => {
  const result = selectRelevantCourses(courses, '강서구에서 산책 코스 추천해줘', 2)
  assert.equal(result[0].id, '1')
  assert.equal(result[0].district, '강서구')
})

test('여행과 무관한 질문에는 코스 후보를 반환하지 않는다', () => {
  assert.deepEqual(selectRelevantCourses(courses, '1+1은 뭐야?'), [])
  assert.deepEqual(selectRelevantCourses(courses, '영화 추천해줘'), [])
})

test('후속 질문에서는 직전 사용자 질문의 지역을 유지한다', async () => {
  const client = { responses: { create: async () => ({ output_text: '종로구 산책 코스를 안내할게요.' }) } }
  const result = await generateChatResponse({
    client,
    model: 'test-model',
    message: '그중 산책은?',
    history: [
      { role: 'user', content: '종로구 역사 코스 추천해줘' },
      { role: 'assistant', content: '종로구 코스를 추천해드릴게요.' },
    ],
    courses,
  })

  assert.ok(result.courses.length > 0)
  assert.ok(result.courses.every(({ district }) => district === '종로구'))
})

test('이전 지역에 데이터가 없어도 새 질문에 지역이 없으면 서울 전체에서 다시 찾는다', async () => {
  let called = false
  const client = { responses: { create: async () => {
    called = true
    return { output_text: '비 오는 날 방문하기 좋은 코스를 안내할게요.' }
  } } }
  const result = await generateChatResponse({
    client,
    model: 'test-model',
    message: '비 오는 날 실내 코스 알려줘',
    history: [
      { role: 'user', content: '강동구 야경 코스 알려줘' },
      { role: 'assistant', content: '현재 등록된 여행코스 중 강동구 데이터가 없습니다.' },
    ],
    courses,
  })

  assert.equal(called, true)
  assert.ok(result.courses.length > 0)
  assert.ok(result.courses.some(({ district }) => district !== '강동구'))
  assert.doesNotMatch(result.answer, /강동구 데이터가 없습니다/)
})

test('Responses API에 시스템 지침과 선별 데이터만 전달한다', async () => {
  let request
  const client = { responses: { create: async (payload) => {
    request = payload
    return { output_text: '강서 한강 산책을 추천해요.' }
  } } }
  const result = await generateChatResponse({ client, model: 'test-model', message: '강서 산책', history: [], courses })
  assert.equal(request.model, 'test-model')
  assert.match(request.instructions, /코스 후보 데이터/)
  assert.match(request.input.at(-1).content, /강서 한강 산책/)
  assert.equal(result.courses[0].district, '강서구')
  assert.equal(request.reasoning.effort, 'low')
  assert.equal(request.max_output_tokens, 4096)
})

test('output_text 헬퍼가 없어도 output 배열에서 텍스트를 찾는다', () => {
  const response = {
    output: [{ type: 'message', content: [{ type: 'output_text', text: '중첩된 답변입니다.' }] }],
  }
  assert.equal(extractResponseText(response), '중첩된 답변입니다.')
})

test('첫 응답이 비어 있으면 더 큰 출력 한도로 한 번 재시도한다', async () => {
  const requests = []
  const client = { responses: { create: async (payload) => {
    requests.push(payload)
    if (requests.length === 1) {
      return { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [] }
    }
    return { output_text: '재시도 후 정상 답변' }
  } } }

  const result = await generateChatResponse({ client, model: 'gpt-5-mini', message: '강서 산책', history: [], courses })
  assert.equal(result.answer, '재시도 후 정상 답변')
  assert.equal(requests.length, 2)
  assert.equal(requests[1].max_output_tokens, 8192)
})

test('두 응답이 모두 비어도 인사에 맞는 안전 답변을 반환한다', async () => {
  const client = { responses: { create: async () => ({ status: 'completed', output: [] }) } }
  const result = await generateChatResponse({ client, model: 'gpt-5-mini', message: '안녕', history: [], courses })
  assert.match(result.answer, /안녕하세요/)
  assert.equal(result.courses.length, 0)
})

test('사용량 초과와 속도 제한을 구분한다', () => {
  assert.equal(mapOpenAIError({ status: 429, code: 'insufficient_quota' }).code, 'QUOTA_EXCEEDED')
  assert.equal(mapOpenAIError({ status: 429, message: 'rate limit' }).code, 'RATE_LIMIT')
  assert.equal(mapOpenAIError({ status: 403 }).code, 'MODEL_ACCESS_ERROR')
})
