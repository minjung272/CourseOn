import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildConditionQuery,
  parseConditions,
  rankCourses,
} from './recommendationService.js'

const courses = [
  { id: 'history', title: '역사 코스', tags: ['역사', '문화예술'] },
  { id: 'nature', title: '자연 코스', tags: ['자연', '산책'] },
  { id: 'food', title: '맛집 코스', tags: ['맛집', '도심여행'] },
]

test('쿼리에서 유효한 추천 조건만 복원한다', () => {
  const conditions = parseConditions({
    companion: 'couple',
    interests: 'food-cafe,food-cafe,invalid',
    preferredArea: 'gangnam',
  })

  assert.equal(conditions.companion, 'couple')
  assert.deepEqual(conditions.interests, ['food-cafe'])
  assert.equal(conditions.preferredArea, 'gangnam')
})

test('선택 조건은 새로고침 가능한 쿼리로 변환된다', () => {
  const conditions = parseConditions({
    companion: 'solo',
    interests: ['history-culture', 'nature-healing'],
    transport: 'walking',
  })

  assert.deepEqual(buildConditionQuery(conditions), {
    companion: 'solo',
    interests: 'history-culture,nature-healing',
    transport: 'walking',
  })
})

test('역사 관심사를 선택하면 역사 태그 코스가 우선한다', () => {
  const conditions = parseConditions({ interests: 'history-culture' })
  const result = rankCourses(courses, conditions)

  assert.equal(result.courses[0].id, 'history')
  assert.ok(result.courses[0].recommendation.score > 0)
})

test('자연 힐링 조건과 맛집 조건은 서로 다른 코스를 추천한다', () => {
  const nature = rankCourses(courses, parseConditions({ interests: 'nature-healing' }))
  const food = rankCourses(courses, parseConditions({ interests: 'food-cafe' }))

  assert.equal(nature.courses[0].id, 'nature')
  assert.equal(food.courses[0].id, 'food')
})

test('조건이 없으면 원래 순서를 유지하며 fallback으로 표시한다', () => {
  const result = rankCourses(courses, parseConditions())

  assert.equal(result.isFallback, true)
  assert.deepEqual(result.courses.map(({ id }) => id), ['history', 'nature', 'food'])
})
