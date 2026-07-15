import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'
import OpenAI from 'openai'
import { generateChatResponse, mapOpenAIError } from './chatService.js'
import { BoardError, BoardStore } from './boardStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const port = Number(process.env.PORT) || 3000
const model = process.env.OPENAI_MODEL || 'gpt-5.6'
const boardDataFile = process.env.BOARD_DATA_FILE
  ? path.resolve(process.env.BOARD_DATA_FILE)
  : path.join(rootDir, 'server/data/boards.json')
let courseCache

async function loadCourses() {
  if (courseCache) return courseCache
  const raw = await readFile(path.join(rootDir, 'public/data/courses/seoul.json'), 'utf8')
  const parsed = JSON.parse(raw)
  const districtRaw = await readFile(path.join(rootDir, 'src/shared/data/districtCourses.json'), 'utf8')
  const districtCourses = JSON.parse(districtRaw).map((course) => ({
    ...course,
    region: { code: '1', name: '서울', districtCode: course.district },
  }))
  courseCache = [...districtCourses, ...(Array.isArray(parsed.courses) ? parsed.courses : [])]
  return courseCache
}

export function createApp({ client, boardStore } = {}) {
  const app = express()
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const openai = client || (apiKey ? new OpenAI({ apiKey }) : null)

  app.disable('x-powered-by')
  const boards = boardStore || new BoardStore(boardDataFile)

  app.use(express.json({ limit: '7mb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, openAIConfigured: Boolean(openai), model })
  })

  app.post('/api/chat', async (request, response) => {
    const message = typeof request.body?.message === 'string' ? request.body.message.trim() : ''

    if (!message || message.length > 500) {
      return response.status(400).json({ code: 'INVALID_MESSAGE', message: '질문을 1~500자로 입력해주세요.' })
    }
    if (!openai) {
      return response.status(503).json({
        code: 'CONFIGURATION_ERROR',
        message: '.env 파일에 OPENAI_API_KEY를 입력한 뒤 개발 서버를 다시 실행해주세요.',
      })
    }

    try {
      const courses = await loadCourses()
      const result = await generateChatResponse({
        client: openai,
        model,
        message,
        history: request.body?.history,
        courses,
      })
      return response.json(result)
    } catch (error) {
      const mapped = mapOpenAIError(error)
      console.error('[chat-api]', error?.status || '', error?.code || '', error?.message || error)
      return response.status(mapped.status).json(mapped)
    }
  })

  function boardError(response, error) {
    if (error instanceof BoardError) {
      return response.status(error.status).json({ code: error.code, message: error.message })
    }
    console.error('[board-api]', error?.message || error)
    return response.status(500).json({ code: 'BOARD_ERROR', message: '게시판 요청을 처리하지 못했습니다.' })
  }

  app.get('/api/boards', async (request, response) => {
    try {
      const data = await boards.list({ category: request.query.category, keyword: request.query.keyword })
      return response.json({ boards: data })
    } catch (error) {
      return boardError(response, error)
    }
  })

  app.get('/api/boards/:id', async (request, response) => {
    try {
      return response.json(await boards.get(request.params.id, { incrementViews: request.query.increment !== 'false' }))
    } catch (error) {
      return boardError(response, error)
    }
  })

  app.post('/api/boards', async (request, response) => {
    try {
      return response.status(201).json(await boards.create(request.body || {}))
    } catch (error) {
      return boardError(response, error)
    }
  })

  app.put('/api/boards/:id', async (request, response) => {
    try {
      return response.json(await boards.update(request.params.id, request.body || {}))
    } catch (error) {
      return boardError(response, error)
    }
  })

  app.delete('/api/boards/:id', async (request, response) => {
    try {
      await boards.delete(request.params.id, request.body?.password)
      return response.status(204).end()
    } catch (error) {
      return boardError(response, error)
    }
  })

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(rootDir, 'dist')))
    app.get(/.*/, (_request, response) => response.sendFile(path.join(rootDir, 'dist/index.html')))
  }

  return app
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  createApp().listen(port, '127.0.0.1', () => {
    console.log(`Course On API: http://127.0.0.1:${port}`)
    if (!process.env.OPENAI_API_KEY) console.log('OPENAI_API_KEY가 비어 있습니다. .env에 키를 입력해주세요.')
  })
}
