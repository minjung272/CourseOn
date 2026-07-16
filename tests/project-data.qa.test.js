import test from 'node:test'
import assert from 'node:assert/strict'
import seoulData from '../public/data/courses/seoul.json' with { type: 'json' }

const courses = seoulData.courses
const expectedTags = [
  '도심여행',
  '맛집',
  '문화예술',
  '산책',
  '야경',
  '역사',
  '자연',
  '체험',
  '혼자',
]

test('배포 데이터는 실제 서울 여행코스 51건만 포함한다', () => {
  assert.equal(seoulData.total, 51)
  assert.equal(courses.length, 51)
  assert.ok(courses.every((course) => !String(course.id).startsWith('demo-')))
})

test('코스 ID와 key는 모두 존재하며 중복되지 않는다', () => {
  const ids = courses.map(({ id }) => String(id))
  const keys = courses.map(({ key }) => String(key))

  assert.ok(ids.every(Boolean))
  assert.ok(keys.every(Boolean))
  assert.equal(new Set(ids).size, courses.length)
  assert.equal(new Set(keys).size, courses.length)
})

test('목록·상세·지도에 필요한 필수 데이터가 유효하다', () => {
  for (const course of courses) {
    assert.ok(course.title?.trim(), `제목 누락: ${course.id}`)
    assert.ok(course.region?.name, `지역 누락: ${course.id}`)
    assert.ok(Number.isFinite(course.latitude), `위도 누락: ${course.id}`)
    assert.ok(Number.isFinite(course.longitude), `경도 누락: ${course.id}`)
    assert.ok(Array.isArray(course.tags), `태그 형식 오류: ${course.id}`)
  }
})

test('코스 태그는 정해진 9개 분류만 사용한다', () => {
  const actualTags = [...new Set(courses.flatMap(({ tags }) => tags))].sort((a, b) =>
    a.localeCompare(b, 'ko'),
  )

  assert.deepEqual(actualTags, expectedTags)
})

test('대표 이미지 누락 6건은 null로 유지한다', () => {
  assert.equal(courses.filter(({ imageUrl }) => imageUrl === null).length, 6)
})
