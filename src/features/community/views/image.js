function isValidImageFile(file) {
  if (!file) return false
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
}

function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('이미지를 선택해주세요.'))
      return
    }

    if (!isValidImageFile(file)) {
      reject(new Error('jpg, jpeg, png 형식의 5MB 이하 이미지만 업로드할 수 있습니다.'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('이미지를 읽는 중 오류가 발생했습니다.'))
    reader.readAsDataURL(file)
  })
}

export { readImageAsBase64 }