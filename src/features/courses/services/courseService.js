const COURSE_DATA_URL = '/data/courses/seoul.json'

let cachedCourses = null

export async function fetchCourses() {
  if (cachedCourses) {
    return cachedCourses
  }

  const response = await fetch(COURSE_DATA_URL)

  if (!response.ok) {
    throw new Error('여행코스 데이터를 불러오지 못했습니다.')
  }

  const data = await response.json()
  cachedCourses = Array.isArray(data.courses) ? data.courses : []

  return cachedCourses
}

export async function fetchCourseById(courseId) {
  const courses = await fetchCourses()

  return courses.find((course) => String(course.id) === String(courseId)) ?? null
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
