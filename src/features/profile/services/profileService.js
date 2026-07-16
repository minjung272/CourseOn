const PROFILE_STORAGE_KEY = 'course-on:local-profile'

function getStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function getLocalProfile() {
  const storage = getStorage()
  if (!storage) return null

  try {
    const profile = JSON.parse(storage.getItem(PROFILE_STORAGE_KEY) ?? 'null')
    if (!profile || typeof profile !== 'object') return null

    const name = String(profile.name ?? '').trim()
    const password = String(profile.password ?? '').trim()
    return name && password ? { name, password } : null
  } catch {
    return null
  }
}

export function saveLocalProfile({ name, password }) {
  const normalizedProfile = {
    name: String(name ?? '').trim(),
    password: String(password ?? '').trim(),
  }

  if (!normalizedProfile.name) throw new Error('이름을 입력해주세요.')
  if (normalizedProfile.name.length > 30) throw new Error('이름은 30자 이하로 입력해주세요.')
  if (normalizedProfile.password.length < 4 || normalizedProfile.password.length > 20) {
    throw new Error('비밀번호는 4~20자로 입력해주세요.')
  }

  getStorage()?.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalizedProfile))
  return normalizedProfile
}

export function clearLocalProfile() {
  getStorage()?.removeItem(PROFILE_STORAGE_KEY)
}
