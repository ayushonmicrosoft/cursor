const { chromium } = require('playwright')

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5173'
const email = process.env.AUDIT_EMAIL || 'admin@booth.local'
const password = process.env.AUDIT_PASSWORD || 'booth123!'

const routes = [
  '/',
  '/login',
  '/signup',
  '/forgot',
  '/help',
  '/t/demo-team',
  '/t/demo-team/o/demo-office/map',
  '/t/demo-team/o/demo-office/roster',
  '/t/demo-team/o/demo-office/reports',
  '/t/demo-team/o/demo-office/audit',
  '/t/demo-team/o/demo-office/org-chart',
  '/t/demo-team/o/demo-office/reservations',
  '/shared/f0c7b7dd-3f44-43cb-b8ab-1d4791ca0101/demo-share-engineering-hub',
  '/invite/f8fa5ee7-48b0-4b11-b4c2-2f9e2cbf6606',
]

const ignoredConsole = [/Download the React DevTools/, /^\[vite\] /]
const routeErrorText =
  /(unexpected error|not found|failed to load|couldn't finish|invalid invite|invalid share)/i

async function signIn(page) {
  await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /log in/i }).click()
  await page.waitForURL(/\/(dashboard|t\/)/, { timeout: 30_000 })
}

async function auditRoute(page, route) {
  await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30_000 })
  const body = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '')
  return {
    route,
    url: page.url(),
    title: await page.title(),
    hasPricing: /\bpricing\b/i.test(body),
    hasFloorcraft: /\bFloorcraft\b/.test(body),
    hasOandOcraft: /OandOcraft/.test(body),
    hasErrorText: routeErrorText.test(body),
  }
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const consoleEvents = []

  page.on('console', (message) => {
    const text = message.text()
    if (ignoredConsole.some((pattern) => pattern.test(text))) return
    consoleEvents.push({ type: message.type(), text })
  })
  page.on('pageerror', (error) => {
    consoleEvents.push({ type: 'pageerror', text: error.message })
  })

  await signIn(page)
  const results = []
  for (const route of routes) {
    results.push(await auditRoute(page, route))
  }
  await browser.close()

  const failures = results.filter((row) => row.hasErrorText)
  const seriousConsole = consoleEvents.filter((event) =>
    ['error', 'warning', 'warn', 'pageerror'].includes(event.type),
  )

  console.log(JSON.stringify({ baseURL, results, consoleEvents }, null, 2))

  if (failures.length || seriousConsole.length) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
