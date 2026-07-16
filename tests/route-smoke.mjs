const webBaseUrl = process.env.QA_WEB_URL || 'http://localhost:5173'
const apiBaseUrl = process.env.QA_API_URL || 'http://127.0.0.1:3000'

const routes = [
  '/',
  '/courses',
  '/courses/2385683',
  '/courses/not-found',
  '/recommend',
  '/recommend/result?companion=연인&interest=맛집&region=강남&style=자유롭게&transport=대중교통',
  '/map',
  '/boards',
  '/boards/write',
  '/chatbot',
]

let failed = false

for (const route of routes) {
  try {
    const response = await fetch(`${webBaseUrl}${route}`)
    const ok = response.ok && (response.headers.get('content-type') || '').includes('text/html')
    console.log(`${ok ? 'PASS' : 'FAIL'} WEB ${response.status} ${route}`)
    failed ||= !ok
  } catch (error) {
    console.log(`FAIL WEB ${route} - ${error.message}`)
    failed = true
  }
}

try {
  const response = await fetch(`${apiBaseUrl}/api/health`)
  const health = await response.json()
  const ok = response.ok && health.ok === true
  console.log(`${ok ? 'PASS' : 'FAIL'} API ${response.status} /api/health`)
  failed ||= !ok
} catch (error) {
  console.log(`FAIL API /api/health - ${error.message}`)
  failed = true
}

if (failed) process.exitCode = 1
