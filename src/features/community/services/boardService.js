class BoardApiError extends Error {
  constructor(message, code = 'BOARD_ERROR', status = 500) {
    super(message)
    this.name = 'BoardApiError'
    this.code = code
    this.status = status
  }
}

const STORAGE_KEY = 'course-on-boards'

const initialBoards = [
  {
    "id": 1,
    "category": "여행 후기",
    "title": "서울 2박 3일 혼자 여행 다녀왔어요! 코스 공유합니다 😊",
    "author": "여행좋아",
    "content": "서울에서 2박 3일 동안 혼자 여행하며 좋았던 코스를 공유해요.\n\n첫날은 한강을 산책하고, 둘째 날은 북촌과 서촌 골목을 천천히 둘러봤어요. 마지막 날에는 남산에서 서울 야경을 감상했습니다. 대중교통으로 이동하기 편해서 혼자 여행하기에도 좋았어요.",
    "tags": [
      "서울여행",
      "혼자여행",
      "한강",
      "북촌"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 524,
    "createdAt": "2026-07-14T09:00:00.000Z",
    "updatedAt": "2026-07-14T09:00:00.000Z"
  },
  {
    "id": 2,
    "category": "질문 & 답변",
    "title": "경복궁 근처 맛집 추천 부탁드려요!",
    "author": "서울탐방러",
    "content": "이번 주말에 경복궁과 서촌을 방문할 예정입니다. 근처에서 혼자 편하게 먹을 수 있는 한식 맛집이나 분위기 좋은 카페를 추천해주세요.",
    "tags": [
      "경복궁",
      "서촌",
      "맛집"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 187,
    "createdAt": "2026-07-14T07:30:00.000Z",
    "updatedAt": "2026-07-14T07:30:00.000Z"
  },
  {
    "id": 3,
    "category": "여행 팁",
    "title": "대중교통으로 서울 여행하는 꿀팁 정리",
    "author": "지하철덕후",
    "content": "서울 여행은 지하철과 버스만 잘 활용해도 대부분의 명소를 편하게 방문할 수 있어요. 환승 시간을 줄이려면 같은 권역의 장소를 하루 코스로 묶고, 출퇴근 시간대는 피하는 것을 추천합니다.",
    "tags": [
      "대중교통",
      "여행팁",
      "지하철"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 312,
    "createdAt": "2026-07-13T10:20:00.000Z",
    "updatedAt": "2026-07-13T10:20:00.000Z"
  },
  {
    "id": 4,
    "category": "여행 후기",
    "title": "한강 야경이 정말 예뻤던 서울 데이트 코스 💜",
    "author": "햇살가득",
    "content": "여의도 한강공원에서 노을을 보고 야경까지 즐겼어요. 산책로가 잘 되어 있고 주변에 카페도 많아서 연인과 여유롭게 시간을 보내기 좋았습니다.",
    "tags": [
      "한강",
      "야경",
      "데이트"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 645,
    "createdAt": "2026-07-13T08:10:00.000Z",
    "updatedAt": "2026-07-13T08:10:00.000Z"
  },
  {
    "id": 5,
    "category": "자유 게시판",
    "title": "여러분의 최애 서울 명소는 어디인가요?",
    "author": "서울사랑",
    "content": "서울에는 유명 관광지뿐 아니라 동네마다 매력적인 장소가 정말 많은 것 같아요. 여러분이 자주 찾거나 다른 사람에게 추천하고 싶은 서울 명소를 알려주세요!",
    "tags": [
      "서울명소",
      "추천"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 278,
    "createdAt": "2026-07-12T05:40:00.000Z",
    "updatedAt": "2026-07-12T05:40:00.000Z"
  },
  {
    "id": 6,
    "category": "공지사항",
    "title": "Course On 커뮤니티 이용 가이드 안내",
    "author": "운영자",
    "content": "Course On 커뮤니티에서는 서울 여행 후기와 질문, 유용한 여행 팁을 자유롭게 나눌 수 있습니다. 타인을 배려하는 표현을 사용하고 개인정보는 게시하지 않도록 주의해주세요.",
    "tags": [
      "공지",
      "이용안내"
    ],
    "imageUrl": null,
    "passwordHash": "33902b772fc45d0833454e3f61e0eebb:801bd3fc87ff2dcce217b94bf9f189fd4bbddada6b49cdb6ad72d42a9be695b1eed347d440b2c0d593ba31e4ea734234ac86d09008e3eab6c2b10ce16dbab213",
    "views": 102,
    "createdAt": "2026-07-11T02:00:00.000Z",
    "updatedAt": "2026-07-11T02:00:00.000Z"
  }
]

function readBoards() {
  if (typeof window === 'undefined') return initialBoards

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialBoards
  } catch {
    return initialBoards
  }
}

function writeBoards(boards) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
  }
}

function toPublicBoard(board) {
  return {
    ...board,
    date: board.createdAt?.slice(0, 10).replaceAll('-', '.') || '',
  }
}

function normalizePassword(value) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    throw new BoardApiError('비밀번호를 입력해주세요. 공백만 입력할 수 없습니다.', 'PASSWORD_REQUIRED', 400)
  }

  if (trimmed.length < 4 || trimmed.length > 20) {
    throw new BoardApiError('비밀번호는 공백을 제외하고 4~20자로 입력해주세요.', 'INVALID_PASSWORD_FORMAT', 400)
  }

  return trimmed
}

export async function fetchBoards() {
  const boards = readBoards()
  return boards.map(toPublicBoard)
}

export async function fetchBoard(id, { incrementViews = true } = {}) {
  const boards = readBoards()
  const board = boards.find((item) => item.id === Number(id))

  if (!board) {
    throw new BoardApiError('게시글을 찾을 수 없습니다.', 'NOT_FOUND', 404)
  }

  if (incrementViews) {
    board.views += 1
    writeBoards(boards)
  }

  return toPublicBoard(board)
}

export async function createBoard(board) {
  const password = normalizePassword(board?.password)

  const boards = readBoards()
  const created = {
    id: Date.now(),
    category: board.category || '자유 게시판',
    title: board.title || '제목 없음',
    author: board.author || '익명',
    content: board.content || '',
    tags: Array.isArray(board.tags) ? board.tags : [],
    imageUrl: board.imageUrl ?? null,
    password,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  boards.unshift(created)
  writeBoards(boards)
  return toPublicBoard(created)
}

export async function updateBoard(id, board) {
  const password = normalizePassword(board?.password)

  const boards = readBoards()
  const target = boards.find((item) => item.id === Number(id))

  if (!target) {
    throw new BoardApiError('게시글을 찾을 수 없습니다.', 'NOT_FOUND', 404)
  }

  if (String(password) !== String(target.password || '')) {
    throw new BoardApiError('비밀번호가 일치하지 않습니다.', 'INVALID_PASSWORD', 403)
  }

  Object.assign(target, {
    ...target,
    ...board,
    id: target.id,
    password: target.password,
    updatedAt: new Date().toISOString(),
  })

  writeBoards(boards)
  return toPublicBoard(target)
}

export async function deleteBoard(id, password) {
  const normalizedPassword = normalizePassword(password)

  const boards = readBoards()
  const index = boards.findIndex((item) => item.id === Number(id))

  if (index < 0) {
    throw new BoardApiError('게시글을 찾을 수 없습니다.', 'NOT_FOUND', 404)
  }

  const target = boards[index]
  if (String(normalizedPassword) !== String(target.password || '')) {
    throw new BoardApiError('비밀번호가 일치하지 않습니다.', 'INVALID_PASSWORD', 403)
  }

  boards.splice(index, 1)
  writeBoards(boards)
  return null
}