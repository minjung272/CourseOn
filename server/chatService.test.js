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
