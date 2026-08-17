import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const h1 = document.querySelector('h1')
  const cs = getComputedStyle(h1)
  return { opacity: cs.opacity, animationName: cs.animationName, animationPlayState: cs.animationPlayState, animationDuration: cs.animationDuration }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: 'debug-anim.png' })
await browser.close()
