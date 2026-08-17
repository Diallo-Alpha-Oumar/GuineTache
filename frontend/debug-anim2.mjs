import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const pref = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
console.log('prefers-reduced-motion default:', pref)
await page.goto('http://localhost:5173/', { waitUntil: 'load' })
const t0 = Date.now()
await page.waitForTimeout(50)
let info = await page.evaluate(() => {
  const h1 = document.querySelector('h1')
  const cs = getComputedStyle(h1)
  return { opacity: cs.opacity, animationName: cs.animationName, animationDuration: cs.animationDuration, animationPlayState: cs.animationPlayState }
})
console.log('at +50ms:', JSON.stringify(info))
await page.waitForTimeout(300)
info = await page.evaluate(() => {
  const h1 = document.querySelector('h1')
  const cs = getComputedStyle(h1)
  return { opacity: cs.opacity }
})
console.log('at +350ms:', JSON.stringify(info))
await page.waitForTimeout(1000)
info = await page.evaluate(() => {
  const h1 = document.querySelector('h1')
  const cs = getComputedStyle(h1)
  return { opacity: cs.opacity }
})
console.log('at +1350ms:', JSON.stringify(info))
await browser.close()
