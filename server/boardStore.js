import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const scryptAsync = promisify(scrypt)
const VALID_CATEGORIES = new Set(['여행 후기', '질문 & 답변', '여행 팁', '자유 게시판', '공지사항'])

export class BoardError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'BoardError'
    this.code = code
    this.status = status
  }
}

function requireText(value, field, label, maxLength) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new BoardError('VALIDATION_ERROR', `${label}을(를) 입력해주세요.`)
  if (text.length > maxLength) throw new BoardError('VALIDATION_ERROR', `${label}은(는) ${maxLength}자 이하여야 합니다.`)
  return text
}

function normalizePassword(value) {
  const password = typeof value === 'string' ? value.trim() : ''
  if (!password) throw new BoardError('PASSWORD_REQUIRED', '비밀번호는 공백일 수 없습니다.')
  if (password.length < 4 || password.length > 20) {
    throw new BoardError('INVALID_PASSWORD_FORMAT', '비밀번호는 공백을 제외하고 4~20자로 입력해주세요.')
  }
  return password
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return [...new Set(tags.map((tag) => String(tag).trim().replace(/^#/, '')).filter(Boolean))]
    .slice(0, 5)
    .map((tag) => tag.slice(0, 20))
}

function normalizeImage(imageUrl) {
  if (!imageUrl) return null
  if (typeof imageUrl !== 'string' || imageUrl.length > 7_000_000) {
    throw new BoardError('INVALID_IMAGE', '이미지 크기가 너무 큽니다.')
  }
  if (!/^data:image\/(png|jpeg);base64,/i.test(imageUrl)) {
    throw new BoardError('INVALID_IMAGE', 'JPG 또는 PNG 이미지만 등록할 수 있습니다.')
  }
  return imageUrl
}

function normalizeBoardInput(input, existing = {}) {
  const category = requireText(input.category ?? existing.category, 'category', '카테고리', 30)
  if (!VALID_CATEGORIES.has(category)) throw new BoardError('VALIDATION_ERROR', '올바른 카테고리를 선택해주세요.')

  return {
    category,
    title: requireText(input.title ?? existing.title, 'title', '제목', 100),
    author: requireText(input.author ?? existing.author, 'author', '작성자', 30),
    content: requireText(input.content ?? existing.content, 'content', '내용', 3000),
    tags: normalizeTags(input.tags ?? existing.tags),
    imageUrl: input.imageUrl === undefined ? (existing.imageUrl || null) : normalizeImage(input.imageUrl),
  }
}

export async function hashPassword(value) {
  const password = normalizePassword(value)
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, 64)
  return `${salt}:${Buffer.from(derivedKey).toString('hex')}`
}

export async function verifyPassword(value, storedHash) {
  const password = normalizePassword(value)
  const [salt, hashHex] = String(storedHash || '').split(':')
  if (!salt || !hashHex) return false
  const stored = Buffer.from(hashHex, 'hex')
  const derived = Buffer.from(await scryptAsync(password, salt, stored.length))
  return stored.length === derived.length && timingSafeEqual(stored, derived)
}

function publicBoard(board) {
  const { passwordHash: _passwordHash, ...safe } = board
  return {
    ...safe,
    date: safe.createdAt.slice(0, 10).replaceAll('-', '.'),
  }
}

export class BoardStore {
  constructor(filePath) {
    this.filePath = filePath
    this.writeQueue = Promise.resolve()
    this.ready = this.initialize()
  }

  async initialize() {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    try {
      await readFile(this.filePath, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      await writeFile(this.filePath, '[]\n', 'utf8')
    }
  }

  async readBoards() {
    await this.ready
    const raw = await readFile(this.filePath, 'utf8')
    const boards = JSON.parse(raw)
    if (!Array.isArray(boards)) throw new Error('게시판 저장 파일 형식이 올바르지 않습니다.')
    return boards
  }

  async writeBoards(boards) {
    const tempPath = `${this.filePath}.tmp`
    await writeFile(tempPath, `${JSON.stringify(boards, null, 2)}\n`, 'utf8')
    await rename(tempPath, this.filePath)
  }

  transaction(callback) {
    const operation = this.writeQueue.then(async () => {
      const boards = await this.readBoards()
      const result = await callback(boards)
      await this.writeBoards(boards)
      return result
    })
    this.writeQueue = operation.catch(() => undefined)
    return operation
  }

  async list({ category = '', keyword = '' } = {}) {
    const boards = await this.readBoards()
    const normalizedKeyword = String(keyword).trim().toLowerCase()
    return boards
      .filter((board) => !category || category === '전체 카테고리' || board.category === category)
      .filter((board) => !normalizedKeyword || `${board.title} ${board.author} ${board.content}`.toLowerCase().includes(normalizedKeyword))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(publicBoard)
  }

  async get(id, { incrementViews = false } = {}) {
    const boardId = Number(id)
    if (!Number.isInteger(boardId)) throw new BoardError('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404)

    if (!incrementViews) {
      const boards = await this.readBoards()
      const board = boards.find((item) => item.id === boardId)
      if (!board) throw new BoardError('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404)
      return publicBoard(board)
    }

    return this.transaction(async (boards) => {
      const board = boards.find((item) => item.id === boardId)
      if (!board) throw new BoardError('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404)
      board.views += 1
      return publicBoard(board)
    })
  }

  async create(input) {
    const boardInput = normalizeBoardInput(input)
    const passwordHash = await hashPassword(input.password)

    return this.transaction(async (boards) => {
      const now = new Date().toISOString()
      const board = {
        id: boards.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1,
        ...boardInput,
        passwordHash,
        views: 0,
        createdAt: now,
        updatedAt: now,
      }
      boards.push(board)
      return publicBoard(board)
    })
  }

  async update(id, input) {
    const boardId = Number(id)
    const password = normalizePassword(input.password)

    return this.transaction(async (boards) => {
      const board = boards.find((item) => item.id === boardId)
      if (!board) throw new BoardError('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404)
      if (!await verifyPassword(password, board.passwordHash)) {
        throw new BoardError('INVALID_PASSWORD', '비밀번호가 일치하지 않습니다.', 403)
      }
      Object.assign(board, normalizeBoardInput(input, board), { updatedAt: new Date().toISOString() })
      return publicBoard(board)
    })
  }

  async delete(id, passwordValue) {
    const boardId = Number(id)
    const password = normalizePassword(passwordValue)

    return this.transaction(async (boards) => {
      const index = boards.findIndex((item) => item.id === boardId)
      if (index < 0) throw new BoardError('NOT_FOUND', '게시글을 찾을 수 없습니다.', 404)
      if (!await verifyPassword(password, boards[index].passwordHash)) {
        throw new BoardError('INVALID_PASSWORD', '비밀번호가 일치하지 않습니다.', 403)
      }
      boards.splice(index, 1)
    })
  }
}
