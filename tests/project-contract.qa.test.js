import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function source(relativePath) {
  return readFile(path.join(rootDir, relativePath), 'utf8')
}

async function json(relativePath) {
  return JSON.parse(await source(relativePath))
}

test('모든 지도 코스는 실제 상세 페이지로 이동할 수 있다', async () => {
  const [{ courses }, mapCourses] = await Promise.all([
    json('public/data/courses/seoul.json'),
    json('src/shared/data/districtCourses.json'),
  ])
  const courseIds = new Set(courses.map(({ id }) => String(id)))

  for (const mapCourse of mapCourses) {
    assert.ok(mapCourse.detailId, `${mapCourse.id}: detailId 누락`)
    assert.ok(courseIds.has(String(mapCourse.detailId)), `${mapCourse.id}: 잘못된 detailId`)
  }
})

test('목록·지도·챗봇은 정제된 서울 코스 JSON을 단일 데이터 원본으로 사용한다', async () => {
  const [courseService, server, mapData] = await Promise.all([
    source('src/features/courses/services/courseService.js'),
    source('server/index.js'),
    source('src/shared/data/mapCourses.js'),
  ])

  assert.equal(/featuredCourses/.test(courseService), false, '목록이 데모 코스를 함께 사용함')
  assert.equal(/districtCourses\.json/.test(server), false, '챗봇이 지도 샘플을 함께 사용함')
  assert.equal(/districtCourses\.json/.test(mapData), false, '지도가 별도 샘플을 사용함')
})

test('추천 결과는 하드코딩 코스가 아니라 선택 조건 기반 결과를 사용한다', async () => {
  const recommendResult = await source('src/features/recommendation/RecommendResult.vue')

  assert.equal(/featuredCourses/.test(recommendResult), false, '추천 결과가 데모 코스로 고정됨')
  assert.equal(/(score|rank|recommend|match)/i.test(recommendResult), true, '추천 계산 로직 미사용')
  for (const queryKey of ['companion', 'interest', 'region', 'style', 'transport']) {
    assert.equal(new RegExp(`route\\.query\\.${queryKey}`).test(recommendResult), true, `${queryKey} 조건 미사용`)
  }
})

test('지도 화면의 모든 필터와 새로고침 버튼은 실제 상태에 연결된다', async () => {
  const mapPage = await source('src/features/map/MapPage.vue')
  const selectTags = mapPage.match(/<select\b[^>]*>/g) ?? []
  const unboundSelects = selectTags.filter((tag) => !tag.includes('v-model'))

  assert.deepEqual(unboundSelects, [], `상태에 연결되지 않은 select ${unboundSelects.length}개`)
  assert.equal(/useRoute\(\)/.test(mapPage), true, '상세 화면에서 전달한 course 쿼리를 읽지 않음')
  assert.equal(/<button type="button">/.test(mapPage), false, '동작이 없는 버튼 존재')
})

test('여행코스 화면은 원본에 없는 평점·리뷰·일정을 임의 생성하지 않는다', async () => {
  const courseService = await source('src/features/courses/services/courseService.js')

  assert.equal(/rating:\s*course\.rating\s*\?\?/.test(courseService), false, '평점을 임의 생성함')
  assert.equal(/reviews:\s*course\.reviews\s*\?\?/.test(courseService), false, '리뷰 수를 임의 생성함')
  assert.equal(/buildItinerary/.test(courseService), false, '일정을 임의 생성함')
  assert.equal(/buildDescription/.test(courseService), false, '상세 설명을 임의 생성함')
})

test('등록되지 않은 주소는 404 화면으로 연결된다', async () => {
  const router = await source('src/app/router/index.js')
  assert.equal(/:pathMatch\(\.\*\)\*/.test(router), true, '404 catch-all 라우트 누락')
})

test('운영 서버 실행 명령은 Windows와 Unix에서 동일하게 실행된다', async () => {
  const packageJson = await json('package.json')
  assert.equal(/^NODE_ENV=/.test(packageJson.scripts.start), false, 'Windows에서 NODE_ENV 설정 명령 실패')
})
