import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createBoard,
  deleteBoard,
  fetchBoard,
  fetchBoards,
  updateBoard,
} from './boardService.js'

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  }
}

test.beforeEach(() => {
  globalThis.window = {
    localStorage: createStorage({ 'course-on-boards': '[]' }),
  }
})

test.afterEach(() => {
  delete globalThis.window
})

async function createQaBoard() {
  return createBoard({
    category: '여행 후기',
    title: 'QA 여행 후기',
    author: 'QA 사용자',
    content: '게시판 로컬 저장 테스트입니다.',
    tags: ['QA', '서울'],
    imageUrl: null,
    password: '1234',
  })
}

test('게시글을 localStorage에 작성하고 목록에서 조회한다', async () => {
  const created = await createQaBoard()
  const boards = await fetchBoards()

  assert.equal(boards.length, 1)
  assert.equal(boards[0].id, created.id)
  assert.equal(boards[0].title, 'QA 여행 후기')
})

test('게시글 상세 조회 시 조회수가 증가한다', async () => {
  const created = await createQaBoard()
  const detail = await fetchBoard(created.id)

  assert.equal(detail.views, 1)
})

test('올바른 비밀번호로만 게시글을 수정할 수 있다', async () => {
  const created = await createQaBoard()

  await assert.rejects(
    updateBoard(created.id, { ...created, title: '수정 실패', password: '9999' }),
    /비밀번호가 일치하지 않습니다/,
  )

  const updated = await updateBoard(created.id, {
    ...created,
    title: '수정 성공',
    password: '1234',
  })
  assert.equal(updated.title, '수정 성공')
})

test('올바른 비밀번호로만 게시글을 삭제할 수 있다', async () => {
  const created = await createQaBoard()

  await assert.rejects(deleteBoard(created.id, '9999'), /비밀번호가 일치하지 않습니다/)
  await deleteBoard(created.id, '1234')
  assert.deepEqual(await fetchBoards(), [])
})

test('손상된 게시판 저장값은 초기 게시글로 안전하게 대체한다', async () => {
  globalThis.window.localStorage = createStorage({ 'course-on-boards': '{broken-json' })

  const boards = await fetchBoards()
  assert.ok(boards.length > 0)
  assert.ok(boards.every(({ id, title }) => id && title))
})
