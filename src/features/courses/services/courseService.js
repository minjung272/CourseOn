const COURSE_DATA_URL = '/data/courses/seoul.json'
let cachedCourses = null

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

const DEFAULT_CATEGORY = {
  mainCode: '서울여행',
  middleCode: '추천코스',
  detailCode: '테마여행',
}

function resolveDistrictName(course) {
  const districtCode = course.region?.districtCode

  if (typeof districtCode === 'string' && districtCode.endsWith('구')) {
    return districtCode
  }

  return SEOUL_DISTRICTS[course.region?.legalDistrictCode] ?? '서울 도심'
}

function buildDescription(course, districtName) {
  if (course.description) return course.description

  const theme = course.tags?.[0] ?? '서울여행'
  return `${districtName}의 ${theme} 명소를 천천히 둘러보며 서울의 새로운 매력을 발견하는 추천 여행 코스입니다.`
}

function buildFeatures(tags) {
  const primaryTag = tags[0] ?? '서울여행'
  const secondaryTag = tags[1] ?? '산책'

  return [
    {
      icon: '♟',
      title: '따라가기 쉬운 동선',
      description: '지도에서 위치를 확인하며 부담 없이 이동할 수 있어요.',
    },
    {
      icon: '▣',
      title: `${primaryTag} 포인트`,
      description: `코스의 핵심인 ${primaryTag} 분위기를 충분히 즐겨보세요.`,
    },
    {
      icon: '☕',
      title: `${secondaryTag}와 여유`,
      description: '중간중간 쉬어가며 나만의 서울 여행 장면을 남겨보세요.',
    },
  ]
}

function buildItinerary(course, districtName, tags) {
  const primaryTag = tags[0] ?? '대표 명소'
  const secondaryTag = tags[1] ?? '산책'

  return [
    {
      time: 'START',
      title: `${districtName}에서 여행 시작`,
      description: '출발 전 지도에서 코스의 중심 위치와 이동 수단을 확인해 주세요.',
    },
    {
      time: '1시간',
      title: `${primaryTag} 핵심 구간 둘러보기`,
      description: `${course.title}의 대표 분위기를 느끼며 천천히 이동합니다.`,
    },
    {
      time: '1시간',
      title: `${secondaryTag} 포인트 즐기기`,
      description: '관심 있는 장소에 머물며 사진과 추억을 남겨보세요.',
    },
    {
      time: 'FINISH',
      title: '여유롭게 코스 마무리',
      description: '주변 카페나 맛집에서 오늘의 여행을 정리해 보세요.',
    },
  ]
}

function enrichCourse(course) {
  const districtName = resolveDistrictName(course)
  const tags = Array.isArray(course.tags) ? course.tags : []
  const category = { ...DEFAULT_CATEGORY, ...(course.category ?? {}) }

  return {
    ...course,
    imageUrl: course.imageUrl?.replace(/^http:\/\//, 'https://') ?? null,
    region: {
      code: course.region?.code ?? '1',
      name: course.region?.name ?? '서울',
      districtCode: course.region?.districtCode ?? null,
      legalRegionCode: course.region?.legalRegionCode ?? '11',
      legalDistrictCode: course.region?.legalDistrictCode ?? null,
    },
    districtName,
    tags,
    category,
    description: buildDescription(course, districtName),
    duration: course.duration ?? (tags.includes('도심여행') ? '반나절' : '약 3시간'),
    transport: course.transport ?? (tags.includes('산책') ? '도보 중심' : '대중교통'),
    rating: course.rating ?? 4.6,
    reviews: course.reviews ?? 120,
    features: course.features ?? buildFeatures(tags),
    itinerary: course.itinerary ?? buildItinerary(course, districtName, tags),
  }
}

export async function fetchCourses() {
  if (cachedCourses) {
    return cachedCourses
  }

  const response = await fetch(COURSE_DATA_URL)

  if (!response.ok) {
    throw new Error('여행코스 데이터를 불러오지 못했습니다.')
  }

  const data = await response.json()
  const normalizedCourses = Array.isArray(data.courses)
    ? data.courses.map(enrichCourse)
    : []

  cachedCourses = normalizedCourses

  return cachedCourses
}

export async function fetchCourseById(courseId) {
  const courses = await fetchCourses()

  return courses.find((course) => String(course.id) === String(courseId)) ?? null
}

export async function fetchRelatedCourses(courseId, limit = 3) {
  const courses = await fetchCourses()
  const target = courses.find((course) => String(course.id) === String(courseId))

  if (!target) return []

  return courses
    .filter((course) => String(course.id) !== String(courseId))
    .map((course) => {
      const sharedTags = course.tags.filter((tag) => target.tags.includes(tag)).length
      const sameDistrict = course.districtName === target.districtName ? 2 : 0
      return { course, score: sharedTags * 3 + sameDistrict }
    })
    .sort((a, b) => b.score - a.score || b.course.rating - a.course.rating)
    .slice(0, limit)
    .map(({ course }) => course)
}

export function filterCourses(courses, keyword = '', selectedTags = []) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return courses.filter((course) => {
    const matchesKeyword =
      !normalizedKeyword || course.title.toLowerCase().includes(normalizedKeyword)
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => course.tags.includes(tag))

    return matchesKeyword && matchesTags
  })
}

export function collectCourseTags(courses) {
  return [...new Set(courses.flatMap((course) => course.tags))].sort((a, b) =>
    a.localeCompare(b, 'ko'),
  )
}
