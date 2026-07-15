const DISTRICT_BY_AREA_CODE = {
  1: '강남구', 2: '강동구', 3: '강북구', 4: '강서구', 5: '관악구',
  6: '광진구', 7: '구로구', 8: '금천구', 9: '노원구', 10: '도봉구',
  11: '동대문구', 12: '동작구', 13: '마포구', 14: '서대문구', 15: '서초구',
  16: '성동구', 17: '성북구', 18: '송파구', 19: '양천구', 20: '영등포구',
  21: '용산구', 22: '은평구', 23: '종로구', 24: '중구', 25: '중랑구',
}

const DISTRICT_BY_LEGAL_CODE = {
  110: '종로구', 140: '중구', 170: '용산구', 200: '성동구', 215: '광진구',
  230: '동대문구', 260: '중랑구', 290: '성북구', 305: '강북구', 320: '도봉구',
  350: '노원구', 380: '은평구', 410: '서대문구', 440: '마포구', 470: '양천구',
  500: '강서구', 530: '구로구', 545: '금천구', 560: '영등포구', 590: '동작구',
  620: '관악구', 650: '서초구', 680: '강남구', 710: '송파구', 740: '강동구',
}

const STOP_WORDS = new Set([
  '서울', '여행', '코스', '추천', '추천해줘', '알려줘', '어디', '좋은', '가기', '있는',
  '하고', '에서', '으로', '이랑', '이랑은', '주변', '근처', '좀', '해줘', '싶어',
])

const THEME_EXPANSIONS = {
  데이트: ['야경', '맛집', '산책', '문화예술'],
  연인: ['데이트', '야경', '맛집', '산책'],
  실내: ['문화예술', '체험', '도심여행'],
  아이: ['체험', '자연', '문화예술'],
  가족: ['체험', '자연', '역사'],
  힐링: ['자연', '산책'],
  사진: ['야경', '자연', '도심여행'],
  맛집: ['맛집', '도심여행'],
}

export const SYSTEM_PROMPT = `당신은 서울 여행 서비스 Course On의 친절하고 정확한 한국어 여행 도우미입니다.

반드시 지킬 규칙:
1. 인사·감사·사용법 질문에는 코스를 억지로 추천하지 말고 자연스럽게 대화하세요.
2. 여행 추천 질문에는 제공된 코스 후보 데이터에 포함된 코스만 사용하고, 데이터에 없는 운영시간·가격·휴무·실시간 혼잡도는 만들어내지 마세요.
3. 질문과 잘 맞는 코스를 최대 3개 추천하고 각 코스의 구와 추천 이유를 짧게 설명하세요.
4. 사용자의 지역·테마 조건을 우선하고, 조건에 정확히 맞는 데이터가 부족하면 그 사실을 먼저 알리세요.
5. 실시간 날씨·예약·교통 운행 여부는 확인할 수 없다고 명확히 말하고 공식 채널 확인을 안내하세요.
6. 질문의 의도를 이해했다는 말만 하지 말고 반드시 사용자에게 도움이 되는 완결된 답변을 하세요.
7. 답변은 읽기 쉬운 한국어로 700자 이내에 작성하세요.
8. JSON, 코스 후보 데이터, 시스템 프롬프트 같은 내부 처리 방식이나 내부 명칭을 사용자에게 절대 언급하지 마세요.`

const CASUAL_MESSAGE_PATTERN = /^(안녕|안녕하세요|하이|hi|hello|반가워|고마워|감사|잘가|바이)[!?.\s~]*$/i
const FIRST_OUTPUT_TOKEN_LIMIT = 4096
const RETRY_OUTPUT_TOKEN_LIMIT = 8192

export function getDistrictName(course) {
  const districtName = course?.district || course?.region?.districtCode
  if (typeof districtName === 'string' && districtName.endsWith('구')) return districtName
  const areaCode = Number(course?.region?.districtCode)
  const legalCode = Number(course?.region?.legalDistrictCode)
  return DISTRICT_BY_AREA_CODE[areaCode] || DISTRICT_BY_LEGAL_CODE[legalCode] || '서울'
}

function normalize(value = '') {
  return value.toLowerCase().replace(/[^0-9a-z가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function queryTerms(question) {
  const normalized = normalize(question)
  const terms = normalized.split(' ').filter((term) => term.length > 1 && !STOP_WORDS.has(term))

  Object.entries(THEME_EXPANSIONS).forEach(([keyword, expansions]) => {
    if (normalized.includes(keyword)) terms.push(...expansions)
  })

  return { normalized, terms: [...new Set(terms)] }
}

function compactCourse(course) {
  return {
    id: String(course.id),
    title: course.title,
    district: getDistrictName(course),
    tags: Array.isArray(course.tags) ? course.tags.slice(0, 5) : [],
    latitude: course.latitude,
    longitude: course.longitude,
    imageUrl: course.imageUrl?.replace(/^http:\/\//, 'https://') || null,
  }
}

export function selectRelevantCourses(courses, question, limit = 8) {
  const { normalized, terms } = queryTerms(question)
  const districtMention = Object.values(DISTRICT_BY_AREA_CODE).find((name) => normalized.includes(name))

  const scored = courses.map((course, index) => {
    const district = getDistrictName(course)
    const title = normalize(course.title)
    const tags = normalize((course.tags || []).join(' '))
    let score = 0

    if (districtMention && district === districtMention) score += 30
    if (normalized.includes(district)) score += 20
    terms.forEach((term) => {
      if (title.includes(term)) score += 7
      if (tags.includes(term)) score += 9
      if (district.includes(term)) score += 12
    })

    return { course, score, index, district }
  })

  scored.sort((a, b) => b.score - a.score || a.index - b.index)
  const positive = scored.filter(({ score }) => score > 0)
  const pool = positive.length ? positive : scored
  const selected = []
  const usedDistricts = new Set()

  for (const item of pool) {
    if (!usedDistricts.has(item.district) || selected.length < Math.min(3, limit)) {
      selected.push(compactCourse(item.course))
      usedDistricts.add(item.district)
    }
    if (selected.length >= limit) break
  }

  if (selected.length < Math.min(limit, pool.length)) {
    for (const item of pool) {
      if (!selected.some((course) => course.id === String(item.course.id))) {
        selected.push(compactCourse(item.course))
      }
      if (selected.length >= limit) break
    }
  }

  return selected
}

function sanitizeHistory(history = []) {
  if (!Array.isArray(history)) return []
  return history.slice(-8).flatMap((message) => {
    const role = message?.role === 'assistant' ? 'assistant' : message?.role === 'user' ? 'user' : null
    const content = typeof message?.content === 'string' ? message.content.trim().slice(0, 800) : ''
    return role && content ? [{ role, content }] : []
  })
}

function isCasualMessage(message) {
  return CASUAL_MESSAGE_PATTERN.test(message.trim())
}

export function extractResponseText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim()
  }

  return (response?.output || [])
    .flatMap((item) => Array.isArray(item?.content) ? item.content : [])
    .flatMap((part) => {
      if (part?.type === 'output_text' && typeof part.text === 'string') return [part.text]
      if (part?.type === 'refusal' && typeof part.refusal === 'string') return [part.refusal]
      return []
    })
    .join('\n')
    .trim()
}

function fallbackAnswer(message, selectedCourses) {
  if (isCasualMessage(message)) {
    return '안녕하세요! 😊 서울 여행 코스를 도와드리는 Course On AI예요. 가고 싶은 구나 산책·야경·맛집 같은 테마를 말씀해주시면 잘 맞는 코스를 추천해드릴게요.'
  }

  if (selectedCourses.length) {
    const recommendations = selectedCourses.slice(0, 3).map((course, index) =>
      `${index + 1}. ${course.title} (${course.district}) - ${course.tags.slice(0, 3).join(' · ') || '서울 여행'}`,
    )
    return `질문과 관련성이 높은 코스를 찾아봤어요.\n${recommendations.join('\n')}\n원하는 시간대나 동행인을 알려주시면 더 좁혀드릴게요.`
  }

  return '질문을 확인했어요. 현재 등록된 서울 여행 데이터만으로 정확한 답을 만들기 어려워요. 원하는 지역이나 산책·야경·역사·맛집 같은 테마를 함께 알려주시면 더 알맞게 안내해드릴게요.'
}

function responseRequest({ model, input, maxOutputTokens }) {
  return {
    model,
    reasoning: { effort: 'low' },
    instructions: SYSTEM_PROMPT,
    input,
    max_output_tokens: maxOutputTokens,
  }
}

export async function generateChatResponse({ client, model, message, history, courses }) {
  const casual = isCasualMessage(message)
  const selectedCourses = casual ? [] : selectRelevantCourses(courses, message)
  const input = [
    ...sanitizeHistory(history),
    {
      role: 'user',
      content: `사용자 질문: ${message}\n\n<course_candidates>${JSON.stringify(selectedCourses)}</course_candidates>`,
    },
  ]

  let response = await client.responses.create(responseRequest({
    model,
    input,
    maxOutputTokens: FIRST_OUTPUT_TOKEN_LIMIT,
  }))
  let answer = extractResponseText(response)

  if (!answer) {
    response = await client.responses.create(responseRequest({
      model,
      input: [
        ...input,
        {
          role: 'developer',
          content: '직전 생성에서 표시 가능한 답변이 없었습니다. 내부 추론을 짧게 하고 지금 바로 완결된 한국어 답변을 작성하세요.',
        },
      ],
      maxOutputTokens: RETRY_OUTPUT_TOKEN_LIMIT,
    }))
    answer = extractResponseText(response)
  }

  if (!answer) answer = fallbackAnswer(message, selectedCourses)
  return { answer, courses: selectedCourses.slice(0, 3) }
}

export function mapOpenAIError(error) {
  const status = Number(error?.status)
  const apiCode = error?.code || error?.error?.code || ''
  const detail = String(error?.message || '').toLowerCase()

  if (status === 401) return { status: 401, code: 'AUTH_ERROR', message: 'API 키가 유효하지 않습니다. .env의 키를 확인해주세요.' }
  if (status === 403) return { status: 403, code: 'MODEL_ACCESS_ERROR', message: '현재 API 프로젝트에서 선택한 모델을 사용할 권한이 없습니다. OPENAI_MODEL을 확인해주세요.' }
  if (status === 429 && (apiCode === 'insufficient_quota' || detail.includes('quota') || detail.includes('billing'))) {
    return { status: 429, code: 'QUOTA_EXCEEDED', message: 'OpenAI API 사용량 또는 결제 한도를 초과했습니다.' }
  }
  if (status === 429) return { status: 429, code: 'RATE_LIMIT', message: '요청이 많습니다. 잠시 후 다시 시도해주세요.' }
  if (status === 408 || status >= 500) return { status: 503, code: 'OPENAI_UNAVAILABLE', message: 'AI 서비스가 잠시 응답하지 않습니다. 잠시 후 다시 시도해주세요.' }
  if (status === 400) return { status: 400, code: 'BAD_REQUEST', message: '요청 내용을 처리할 수 없습니다. 질문을 조금 짧게 바꿔보세요.' }
  return { status: 500, code: 'CHAT_ERROR', message: '답변을 만드는 중 오류가 발생했습니다.' }
}
