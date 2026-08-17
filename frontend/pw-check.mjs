import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 700 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
await page.fill('#password', 'MonMotDePasse123')
await page.screenshot({ path: 'pw-hidden.png', clip: { x: 0, y: 150, width: 620, height: 220 } })

await page.click('button[aria-label="Afficher le mot de passe"]')
await page.screenshot({ path: 'pw-visible.png', clip: { x: 0, y: 150, width: 620, height: 220 } })

console.log('ERRORS:', JSON.stringify(errors))
await browser.close()
