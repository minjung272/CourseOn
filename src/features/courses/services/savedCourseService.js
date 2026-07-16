const SAVED_COURSE_KEY = 'course-on:saved-course-ids'

function getStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function getSavedCourseIds() {
  const storage = getStorage()
  if (!storage) return []

  try {
    const savedIds = JSON.parse(storage.getItem(SAVED_COURSE_KEY) ?? '[]')
    return Array.isArray(savedIds) ? [...new Set(savedIds.map(String))] : []
  } catch {
    return []
  }
}

export function isCourseSaved(courseId) {
  return getSavedCourseIds().includes(String(courseId))
}

export function toggleSavedCourse(courseId) {
  const normalizedId = String(courseId)
  const savedIds = new Set(getSavedCourseIds())
  const willBeSaved = !savedIds.has(normalizedId)

  if (willBeSaved) savedIds.add(normalizedId)
  else savedIds.delete(normalizedId)

  getStorage()?.setItem(SAVED_COURSE_KEY, JSON.stringify([...savedIds]))
  return willBeSaved
}
