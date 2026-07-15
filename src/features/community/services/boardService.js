class BoardApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'BoardApiError'
    this.code = code
    this.status = status
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers,
  })

  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new BoardApiError(payload.message || '게시판 요청을 처리하지 못했습니다.', payload.code, response.status)
  }
  return payload
}

export async function fetchBoards() {
  const payload = await request('/api/boards')
  return payload.boards || []
}

export function fetchBoard(id, { incrementViews = true } = {}) {
  const query = incrementViews ? '' : '?increment=false'
  return request(`/api/boards/${id}${query}`)
}

export function createBoard(board) {
  return request('/api/boards', { method: 'POST', body: JSON.stringify(board) })
}

export function updateBoard(id, board) {
  return request(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify(board) })
}

export function deleteBoard(id, password) {
  return request(`/api/boards/${id}`, { method: 'DELETE', body: JSON.stringify({ password }) })
}
