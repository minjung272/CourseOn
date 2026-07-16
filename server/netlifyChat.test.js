import test from 'node:test'
import assert from 'node:assert/strict'
import { createChatHandler } from '../netlify/functions/chat.mjs'

function request(body, method = 'POST') {
  return new Request('http://localhost/api/chat', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })
}

test('Netlify 챗봇 함수는 POST 요청만 허용한다', async () => {
  const handler = createChatHandler({ client: {} })
  const response = await handler(request(null, 'GET'))

  assert.equal(response.status, 405)
})

test('Netlify 챗봇 함수는 기존 answer·courses 응답 형식을 유지한다', async () => {
  const client = {
    responses: {
      create: async () => ({ output_text: '종로구 역사 코스를 추천해드릴게요.' }),
    },
  }
  const handler = createChatHandler({ client, model: 'test-model' })
  const response = await handler(request({ message: '종로구 역사 코스 추천해줘', history: [] }))
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.answer, '종로구 역사 코스를 추천해드릴게요.')
  assert.ok(payload.courses.length > 0)
  assert.ok(payload.courses.every(({ district }) => district === '종로구'))
})

test('데이터가 없는 지역은 Netlify에서도 OpenAI를 호출하지 않는다', async () => {
  let called = false
  const client = { responses: { create: async () => {
    called = true
    return { output_text: '호출되면 안 됩니다.' }
  } } }
  const handler = createChatHandler({ client, model: 'test-model' })
  const response = await handler(request({ message: '강동구 야경 코스 알려줘', history: [] }))
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(called, false)
  assert.deepEqual(payload.courses, [])
  assert.match(payload.answer, /강동구 데이터가 없습니다/)
})
