import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { BoardStore } from './boardStore.js'

async function createStore() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'course-on-board-'))
  return new BoardStore(path.join(directory, 'boards.json'))
}

const input = {
  category: '여행 후기',
  title: '테스트 게시글',
  author: '테스터',
  content: 'CRUD 동작을 확인하는 게시글입니다.',
  tags: ['테스트'],
  password: 'safe-pass',
}

test('공백 비밀번호로 게시글을 작성할 수 없다', async () => {
  const store = await createStore()
  await assert.rejects(() => store.create({ ...input, password: '   ' }), { code: 'PASSWORD_REQUIRED' })
})

test('비밀번호는 해시로 저장되고 공개 응답에서 제외된다', async () => {
  const store = await createStore()
  const created = await store.create(input)
  const stored = await readFile(store.filePath, 'utf8')
  assert.equal(created.passwordHash, undefined)
  assert.equal(stored.includes('safe-pass'), false)
  assert.match(stored, /passwordHash/)
})

test('올바른 비밀번호로만 게시글을 수정할 수 있다', async () => {
  const store = await createStore()
  const created = await store.create(input)
  await assert.rejects(() => store.update(created.id, { title: '실패', password: 'wrong-pass' }), { code: 'INVALID_PASSWORD' })
  const updated = await store.update(created.id, { title: '수정 성공', password: 'safe-pass' })
  assert.equal(updated.title, '수정 성공')
})

test('올바른 비밀번호로만 게시글을 삭제할 수 있다', async () => {
  const store = await createStore()
  const created = await store.create(input)
  await assert.rejects(() => store.delete(created.id, 'wrong-pass'), { code: 'INVALID_PASSWORD' })
  await store.delete(created.id, 'safe-pass')
  assert.equal((await store.list()).length, 0)
})

test('상세 조회 시 조회수가 증가한다', async () => {
  const store = await createStore()
  const created = await store.create(input)
  const viewed = await store.get(created.id, { incrementViews: true })
  assert.equal(viewed.views, 1)
})
