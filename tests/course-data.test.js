import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'))
}

test('정제된 서울 여행코스는 51건이다', async () => {
  const { courses } = await readJson('public/data/courses/seoul.json')
  assert.equal(courses.length, 51)
})

test('여행코스 ID와 key는 비어 있지 않고 중복되지 않는다', async () => {
  const { courses } = await readJson('public/data/courses/seoul.json')
  const ids = courses.map(({ id }) => String(id))
  const keys = courses.map(({ key }) => key)

  assert.ok(ids.every(Boolean))
  assert.ok(keys.every(Boolean))
  assert.equal(new Set(ids).size, courses.length)
  assert.equal(new Set(keys).size, courses.length)
})

test('모든 여행코스는 화면과 지도에 필요한 기본 필드를 가진다', async () => {
  const { courses } = await readJson('public/data/courses/seoul.json')

  for (const course of courses) {
    assert.ok(course.title?.trim(), `${course.id}: 제목 누락`)
    assert.ok(Number.isFinite(course.latitude), `${course.id}: 위도 누락`)
    assert.ok(Number.isFinite(course.longitude), `${course.id}: 경도 누락`)
    assert.ok(Array.isArray(course.tags), `${course.id}: 태그 배열 누락`)
    assert.ok(course.region?.name, `${course.id}: 지역명 누락`)
  }
})

test('대표 이미지가 없는 6건은 null로 유지한다', async () => {
  const { courses } = await readJson('public/data/courses/seoul.json')
  const missingImages = courses.filter(({ imageUrl }) => imageUrl === null)
  assert.equal(missingImages.length, 6)
})

test('지도 샘플의 기존 상세 ID는 실제 정제 코스를 가리킨다', async () => {
  const [{ courses }, mapCourses] = await Promise.all([
    readJson('public/data/courses/seoul.json'),
    readJson('src/shared/data/districtCourses.json'),
  ])
  const courseIds = new Set(courses.map(({ id }) => String(id)))

  for (const mapCourse of mapCourses.filter(({ detailId }) => detailId)) {
    assert.ok(courseIds.has(String(mapCourse.detailId)), `${mapCourse.id}: 존재하지 않는 detailId`)
  }
})

test('지도 샘플은 25개 구를 중복 없이 포함하고 좌표가 유효하다', async () => {
  const mapCourses = await readJson('src/shared/data/districtCourses.json')

  assert.equal(mapCourses.length, 25)
  assert.equal(new Set(mapCourses.map(({ district }) => district)).size, 25)
  for (const course of mapCourses) {
    assert.ok(Number.isFinite(course.latitude), `${course.id}: 위도 누락`)
    assert.ok(Number.isFinite(course.longitude), `${course.id}: 경도 누락`)
  }
})
