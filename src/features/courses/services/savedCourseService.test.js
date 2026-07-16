import test from 'node:test'
import assert from 'node:assert/strict'
import { getSavedCourseIds, isCourseSaved, toggleSavedCourse } from './savedCourseService.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test.beforeEach(() => { globalThis.localStorage = createStorage() })
test.afterEach(() => { delete globalThis.localStorage })

test('코스 저장 상태를 localStorage에서 유지한다', () => {
  assert.equal(toggleSavedCourse(1951266), true)
  assert.deepEqual(getSavedCourseIds(), ['1951266'])
  assert.equal(isCourseSaved('1951266'), true)
})

test('이미 저장된 코스를 다시 누르면 저장을 해제한다', () => {
  toggleSavedCourse('1951266')

  assert.equal(toggleSavedCourse('1951266'), false)
  assert.deepEqual(getSavedCourseIds(), [])
})
