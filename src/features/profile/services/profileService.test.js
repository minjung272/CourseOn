import test from 'node:test'
import assert from 'node:assert/strict'
import { clearLocalProfile, getLocalProfile, saveLocalProfile } from './profileService.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

test.beforeEach(() => { globalThis.localStorage = createStorage() })
test.afterEach(() => { delete globalThis.localStorage })

test('간이 프로필을 localStorage에 저장하고 다시 불러온다', () => {
  const saved = saveLocalProfile({ name: ' 김시열 ', password: ' 1234 ' })

  assert.deepEqual(saved, { name: '김시열', password: '1234' })
  assert.deepEqual(getLocalProfile(), saved)
})

test('간이 프로필을 초기화하면 저장값이 사라진다', () => {
  saveLocalProfile({ name: '김시열', password: '1234' })
  clearLocalProfile()

  assert.equal(getLocalProfile(), null)
})

test('게시판 기본 비밀번호는 4~20자만 허용한다', () => {
  assert.throws(() => saveLocalProfile({ name: '김시열', password: '123' }), /4~20자/)
})
