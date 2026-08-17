import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

// 1. Visitor lands on landing page at "/"
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
console.log('URL after visiting /:', page.url())
await page.screenshot({ path: 'landing-top.png' })

// scroll through sections
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3))
await page.waitForTimeout(300)
await page.screenshot({ path: 'landing-features.png' })

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6))
await page.waitForTimeout(300)
await page.screenshot({ path: 'landing-howitworks.png' })

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(300)
await page.screenshot({ path: 'landing-footer.png' })

// nav link smooth scroll
await page.evaluate(() => window.scrollTo(0, 0))
await page.click('a[href="#fonctionnalites"]')
await page.waitForTimeout(700)
const scrollY = await page.evaluate(() => window.scrollY)
console.log('scrollY after clicking Fonctionnalités:', scrollY)

// CTA buttons navigate correctly
await page.goto('http://localhost:5173/')
await page.click('text=Commencer maintenant')
await page.waitForURL('**/register', { timeout: 5000 })
console.log('Commencer maintenant ->', page.url())

await page.goto('http://localhost:5173/')
await page.click('nav >> text=Se connecter')
await page.waitForURL('**/login', { timeout: 5000 })
console.log('Se connecter ->', page.url())

// mobile menu
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.screenshot({ path: 'landing-mobile.png' })
await page.click('button[aria-label="Ouvrir le menu"]')
await page.waitForTimeout(300)
await page.screenshot({ path: 'landing-mobile-menu.png' })

// authenticated user redirect check
await page.setViewportSize({ width: 1280, height: 800 })
await page.goto('http://localhost:5173/login')
await page.fill('#email', 'admin@guinetache.com')
await page.fill('#password', 'Admin123!')
await page.click('button[type=submit]')
await page.waitForURL('**/admin/dashboard', { timeout: 8000 })
await page.goto('http://localhost:5173/')
await page.waitForURL('**/admin/dashboard', { timeout: 8000 })
console.log('Authenticated admin visiting / redirected to:', page.url())

console.log('ERRORS:', JSON.stringify(errors))
await browser.close()
