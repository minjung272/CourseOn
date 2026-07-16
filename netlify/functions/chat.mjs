import OpenAI from 'openai'
import courseData from '../../public/data/courses/seoul.json' with { type: 'json' }
import { generateChatResponse, mapOpenAIError } from '../../server/chatService.js'

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6'
const DEFAULT_COURSES = Array.isArray(courseData.courses) ? courseData.courses : []
let defaultClient

function getDefaultClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  defaultClient ??= new OpenAI({ apiKey })
  return defaultClient
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export function createChatHandler({ client, model = DEFAULT_MODEL, courses = DEFAULT_COURSES } = {}) {
  return async function chatHandler(request) {
    if (request.method !== 'POST') {
      return json({ code: 'METHOD_NOT_ALLOWED', message: 'POST 요청만 허용됩니다.' }, 405)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ code: 'INVALID_REQUEST', message: '올바른 JSON 요청이 필요합니다.' }, 400)
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > 500) {
      return json({ code: 'INVALID_MESSAGE', message: '질문을 1~500자로 입력해주세요.' }, 400)
    }

    const openai = client || getDefaultClient()
    if (!openai) {
      return json({
        code: 'CONFIGURATION_ERROR',
        message: 'Netlify의 OPENAI_API_KEY 환경변수를 설정한 뒤 다시 배포해주세요.',
      }, 503)
    }

    try {
      const result = await generateChatResponse({
        client: openai,
        model,
        message,
        history: body?.history,
        courses,
      })
      return json(result)
    } catch (error) {
      const mapped = mapOpenAIError(error)
      console.error('[netlify-chat]', error?.status || '', error?.code || '', error?.message || error)
      return json(mapped, mapped.status)
    }
  }
}

export default createChatHandler()
