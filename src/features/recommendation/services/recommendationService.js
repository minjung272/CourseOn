import tagMappings from '../data/tagMappings.json' with { type: 'json' }

const RECOMMENDATION_STORAGE_KEY = 'course-on:recommendation-conditions'

const GROUP_META = [
  { key: 'companion', label: '동행', multiple: false },
  { key: 'interests', label: '관심사', multiple: true },
  { key: 'preferredArea', label: '선호 지역', multiple: false },
  { key: 'travelStyle', label: '여행 스타일', multiple: false },
  { key: 'transport', label: '이동 수단', multiple: false },
]

export function createEmptyConditions() {
  return {
    companion: '',
    interests: [],
    preferredArea: '',
    travelStyle: '',
    transport: '',
  }
}

function toQueryValues(value) {
  const values = Array.isArray(value) ? value : [value]

  return values
    .flatMap((item) => String(item ?? '').split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseConditions(query = {}) {
  const conditions = createEmptyConditions()

  GROUP_META.forEach((group) => {
    const validIds = new Set(Object.keys(tagMappings.mappings[group.key]))
    const values = toQueryValues(query[group.key]).filter((value) => validIds.has(value))
    conditions[group.key] = group.multiple ? [...new Set(values)] : values[0] ?? ''
  })

  return conditions
}

export function buildConditionQuery(conditions) {
  return GROUP_META.reduce((query, group) => {
    const value = conditions[group.key]

    if (Array.isArray(value) && value.length) {
      query[group.key] = value.join(',')
    } else if (!Array.isArray(value) && value) {
      query[group.key] = value
    }

    return query
  }, {})
}

export function saveRecommendationConditions(conditions) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(
    RECOMMENDATION_STORAGE_KEY,
    JSON.stringify(buildConditionQuery(conditions)),
  )
}

export function loadRecommendationConditions() {
  if (typeof sessionStorage === 'undefined') return null

  try {
    const savedQuery = JSON.parse(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY) ?? 'null')
    return savedQuery && typeof savedQuery === 'object'
      ? parseConditions(savedQuery)
      : null
  } catch {
    return null
  }
}

export function clearRecommendationConditions() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(RECOMMENDATION_STORAGE_KEY)
}

function getSelectedIds(group, conditions) {
  const value = conditions[group.key]
  return Array.isArray(value) ? value : value ? [value] : []
}

function getMapping(groupKey, optionId) {
  return tagMappings.mappings[groupKey]?.[optionId] ?? null
}

export function getConditionSummary(conditions) {
  return GROUP_META.map((group) => {
    const selectedMappings = getSelectedIds(group, conditions)
      .map((optionId) => getMapping(group.key, optionId))
      .filter(Boolean)

    return {
      key: group.key,
      label: group.label,
      value: selectedMappings.length
        ? selectedMappings.map((mapping) => mapping.label).join(' · ')
        : '상관없음',
    }
  })
}

export function buildPreferenceProfile(conditions) {
  const selectedMappings = GROUP_META.flatMap((group) =>
    getSelectedIds(group, conditions)
      .map((optionId) => getMapping(group.key, optionId))
      .filter(Boolean),
  )

  return {
    userTags: [...new Set(selectedMappings.flatMap((mapping) => mapping.userTags))],
  }
}

function scoreOption(mapping, courseTags) {
  const matches = courseTags
    .map((tag) => ({ tag, weight: mapping.courseTagWeights[tag] ?? 0 }))
    .filter((match) => match.weight > 0)

  const score = Math.max(0, ...matches.map((match) => match.weight))

  return {
    score,
    matchedTags: matches
      .filter((match) => match.weight === score)
      .map((match) => match.tag),
  }
}

function scoreGroup(group, conditions, courseTags) {
  const matches = getSelectedIds(group, conditions)
    .map((optionId) => {
      const mapping = getMapping(group.key, optionId)
      if (!mapping) return null

      const optionScore = scoreOption(mapping, courseTags)
      return {
        optionId,
        optionLabel: mapping.label,
        ...optionScore,
      }
    })
    .filter((match) => match?.score > 0)

  const rawScore = group.multiple
    ? matches.reduce((sum, match) => sum + match.score, 0)
    : Math.max(0, ...matches.map((match) => match.score))
  const categoryCap = tagMappings.scoringPolicy.categoryCaps[group.key]

  return {
    score: Math.min(rawScore, categoryCap),
    matches,
  }
}

export function rankCourses(courses, conditions) {
  const profile = buildPreferenceProfile(conditions)
  const rankedCourses = courses.map((course, originalIndex) => {
    const courseTags = Array.isArray(course.tags) ? course.tags : []
    const groupResults = GROUP_META.map((group) =>
      scoreGroup(group, conditions, courseTags),
    )
    const score = groupResults.reduce((sum, result) => sum + result.score, 0)
    const matches = groupResults.flatMap((result) => result.matches)

    return {
      ...course,
      recommendation: {
        score,
        matchedTags: [...new Set(matches.flatMap((match) => match.matchedTags))],
        reasons: matches.map((match) => ({
          label: match.optionLabel,
          tags: match.matchedTags,
        })),
      },
      originalIndex,
    }
  })

  const hasPositiveScore = rankedCourses.some((course) => course.recommendation.score > 0)

  rankedCourses.sort((a, b) => {
    if (b.recommendation.score !== a.recommendation.score) {
      return b.recommendation.score - a.recommendation.score
    }

    return a.originalIndex - b.originalIndex
  })

  return {
    courses: rankedCourses,
    isFallback: !hasPositiveScore,
    profile,
  }
}
