import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { BoardStore } from '../server/boardStore.js'
import { createApp } from '../server/index.js'

async function withServer(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'course-on-api-'))
  const boardStore = new BoardStore(path.join(directory, 'boards.json'))
  const server = createApp({ boardStore }).listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  const { port } = server.address()
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options)
  const body = response.status === 204 ? null : await response.json()
  return { response, body }
}

const boardInput = {
  category: '여행 후기',
  title: 'API 테스트 게시글',
  author: '테스터',
  content: '게시판 API 동작을 확인합니다.',
  tags: ['테스트'],
  password: 'safe-pass',
}

test('헬스 체크는 서버와 OpenAI 설정 상태를 반환한다', async () => {
  await withServer(async (baseUrl) => {
    const { response, body } = await jsonRequest(`${baseUrl}/api/health`)
    assert.equal(response.status, 200)
    assert.equal(body.ok, true)
    assert.equal(typeof body.openAIConfigured, 'boolean')
    assert.equal(typeof body.model, 'string')
  })
})

test('챗봇은 빈 질문과 500자 초과 질문을 API 호출 전에 거부한다', async () => {
  await withServer(async (baseUrl) => {
    for (const message of ['', 'a'.repeat(501)]) {
      const { response, body } = await jsonRequest(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      assert.equal(response.status, 400)
      assert.equal(body.code, 'INVALID_MESSAGE')
    }
  })
})

test('게시판 API에서 작성·조회·수정·삭제 흐름이 동작한다', async () => {
  await withServer(async (baseUrl) => {
    const created = await jsonRequest(`${baseUrl}/api/boards`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(boardInput),
    })
    assert.equal(created.response.status, 201)
    assert.equal(created.body.passwordHash, undefined)

    const viewed = await jsonRequest(`${baseUrl}/api/boards/${created.body.id}`)
    assert.equal(viewed.body.views, 1)

    const rejected = await jsonRequest(`${baseUrl}/api/boards/${created.body.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '실패', password: 'wrong-pass' }),
    })
    assert.equal(rejected.response.status, 403)
    assert.equal(rejected.body.code, 'INVALID_PASSWORD')

    const updated = await jsonRequest(`${baseUrl}/api/boards/${created.body.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '수정 성공', password: boardInput.password }),
    })
    assert.equal(updated.response.status, 200)
    assert.equal(updated.body.title, '수정 성공')

    const deleted = await jsonRequest(`${baseUrl}/api/boards/${created.body.id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: boardInput.password }),
    })
    assert.equal(deleted.response.status, 204)
  })
})

test('게시글을 동시에 작성해도 ID가 중복되거나 저장 파일이 손상되지 않는다', async () => {
  await withServer(async (baseUrl) => {
    const created = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        jsonRequest(`${baseUrl}/api/boards`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...boardInput, title: `동시 작성 ${index}` }),
        }),
      ),
    )
    assert.ok(created.every(({ response }) => response.status === 201))

    const { body } = await jsonRequest(`${baseUrl}/api/boards`)
    assert.equal(body.boards.length, 8)
    assert.equal(new Set(body.boards.map(({ id }) => id)).size, 8)
  })
})
