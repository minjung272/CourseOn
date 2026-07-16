import test from 'node:test'
import assert from 'node:assert/strict'
import seoulData from '../../../../public/data/courses/seoul.json' with { type: 'json' }
import {
  collectMapDistricts,
  collectMapThemes,
  filterMapCourses,
  normalizeMapCourses,
} from './mapCourseService.js'

const courses = normalizeMapCourses(seoulData.courses)

test('실제 서울 여행코스 51건을 지도 데이터로 변환한다', () => {
  assert.equal(courses.length, 51)
  assert.equal(new Set(courses.map(({ id }) => id)).size, 51)
  assert.ok(courses.every(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)))
})

test('법정구 코드로 지도에 표시할 자치구 이름을 만든다', () => {
  const jongnoCourse = courses.find((course) => course.region.legalDistrictCode === '110')
  assert.equal(jongnoCourse.districtName, '종로구')
  assert.equal(collectMapDistricts(courses).length, 14)
})

test('실제 코스 태그 9개를 테마 필터로 제공한다', () => {
  assert.deepEqual(collectMapThemes(courses), [
    '도심여행', '맛집', '문화예술', '산책', '야경', '역사', '자연', '체험', '혼자',
  ])
})

test('제목·지역·태그 검색과 지역·테마 필터가 함께 동작한다', () => {
  assert.ok(filterMapCourses(courses, { keyword: '청와대' }).every(({ title }) => title.includes('청와대')))
  assert.ok(filterMapCourses(courses, { district: '종로구' }).every(({ districtName }) => districtName === '종로구'))
  assert.ok(filterMapCourses(courses, { theme: '역사' }).every(({ tags }) => tags.includes('역사')))
  assert.equal(filterMapCourses(courses, { keyword: '존재하지않는검색어' }).length, 0)
})

test('이미지가 없는 코스는 null을 유지해 화면에서 대체 처리한다', () => {
  assert.equal(courses.filter(({ imageUrl }) => imageUrl === null).length, 6)
})
