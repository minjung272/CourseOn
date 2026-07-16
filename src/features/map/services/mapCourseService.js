const MAP_DATA_URL = '/data/courses/seoul.json'

const SEOUL_DISTRICTS = {
  110: '종로구',
  140: '중구',
  170: '용산구',
  200: '성동구',
  215: '광진구',
  230: '동대문구',
  260: '중랑구',
  290: '성북구',
  305: '강북구',
  320: '도봉구',
  350: '노원구',
  380: '은평구',
  410: '서대문구',
  440: '마포구',
  470: '양천구',
  500: '강서구',
  530: '구로구',
  545: '금천구',
  560: '영등포구',
  590: '동작구',
  620: '관악구',
  650: '서초구',
  680: '강남구',
  710: '송파구',
  740: '강동구',
}

export function normalizeMapCourses(courses = []) {
  return courses
    .filter((course) => Number.isFinite(course.latitude) && Number.isFinite(course.longitude))
    .map((course) => ({
      ...course,
      id: String(course.id),
      key: course.key || `1-${course.id}`,
      districtName: SEOUL_DISTRICTS[course.region?.legalDistrictCode] || '서울',
      tags: Array.isArray(course.tags) ? course.tags : [],
      imageUrl: course.imageUrl?.replace(/^http:\/\//, 'https://') || null,
    }))
}

export async function fetchMapCourses() {
  const response = await fetch(MAP_DATA_URL)

  if (!response.ok) {
    throw new Error('지도용 여행코스 데이터를 불러오지 못했습니다.')
  }

  const data = await response.json()
  return normalizeMapCourses(Array.isArray(data.courses) ? data.courses : [])
}

export function collectMapDistricts(courses) {
  return [...new Set(courses.map((course) => course.districtName))]
    .filter((name) => name && name !== '서울')
    .sort((a, b) => a.localeCompare(b, 'ko'))
}

export function collectMapThemes(courses) {
  return [...new Set(courses.flatMap((course) => course.tags))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ko'))
}

export function filterMapCourses(courses, { keyword = '', district = '전체', theme = '전체' } = {}) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return courses.filter((course) => {
    const matchesDistrict = district === '전체' || course.districtName === district
    const matchesTheme = theme === '전체' || course.tags.includes(theme)
    const searchableText = `${course.title} ${course.districtName} ${course.tags.join(' ')}`.toLowerCase()
    const matchesKeyword = !normalizedKeyword || searchableText.includes(normalizedKeyword)

    return matchesDistrict && matchesTheme && matchesKeyword
  })
}
